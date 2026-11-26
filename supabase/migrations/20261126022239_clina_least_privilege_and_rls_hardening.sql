-- CLINA least-privilege Data API grants and RLS policy hardening.
-- Applied to hosted project kpsxjcorglvovolsmcrf.
-- Least-privilege Data API grants for the CLINA public schema.
-- RLS remains the row-level authorization layer; SQL grants are the table/column boundary.
revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- Public directory: expose only fields intended for discovery.
grant select (user_id, public_name, category, biography, specialties, session_price_cents, session_duration_minutes)
  on public.professional_profiles to anon, authenticated;

-- Public availability: expose only scheduling fields, never private profile data.
grant select (professional_id, starts_at, ends_at, is_available)
  on public.availability_slots to anon, authenticated;

-- Public course catalogue only; lesson material is restricted to enrolled users/admins.
grant select (id, title, description, published)
  on public.courses to anon, authenticated;

-- Authenticated user-owned data. RLS policies below remain authoritative.
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

grant insert (user_id, public_name, category, registration_type, registration_number, biography, specialties, session_price_cents, session_duration_minutes)
  on public.professional_profiles to authenticated;
grant update (public_name, category, biography, specialties, session_price_cents, session_duration_minutes)
  on public.professional_profiles to authenticated;

grant select, insert, update, delete on public.availability_slots to authenticated;
grant select on public.appointments to authenticated;
grant select, insert, update on public.clinical_records to authenticated;
grant select, insert, update, delete on public.emotional_entries to authenticated;
grant select on public.payments to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.course_enrollments to authenticated;
grant select on public.course_attempts to authenticated;
grant select on public.certificates to authenticated;
grant select (id, course_id, title, position) on public.course_lessons to authenticated;

-- A single SELECT policy handles public availability; management actions are separate.
drop policy if exists availability_professional_manage on public.availability_slots;
create policy availability_professional_insert
  on public.availability_slots for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and (select public.jwt_app_role()) = 'professional'
  );
create policy availability_professional_update
  on public.availability_slots for update to authenticated
  using (
    (professional_id = (select auth.uid()) and (select public.jwt_app_role()) = 'professional')
    or (select public.jwt_app_role()) = 'admin'
  )
  with check (
    (professional_id = (select auth.uid()) and (select public.jwt_app_role()) = 'professional')
    or (select public.jwt_app_role()) = 'admin'
  );
create policy availability_professional_delete
  on public.availability_slots for delete to authenticated
  using (
    (professional_id = (select auth.uid()) and (select public.jwt_app_role()) = 'professional')
    or (select public.jwt_app_role()) = 'admin'
  );

-- A professional may read only their own clinical records as a professional;
-- a patient may read only records linked to a consultation with that professional.
drop policy if exists clinical_records_participants_read on public.clinical_records;
create policy clinical_records_participants_read
  on public.clinical_records for select to authenticated
  using (
    (
      professional_id = (select auth.uid())
      and (select public.jwt_app_role()) = 'professional'
    )
    or (
      patient_id = (select auth.uid())
      and exists (
        select 1 from public.appointments a
        where a.patient_id = (select auth.uid())
          and a.professional_id = clinical_records.professional_id
      )
    )
    or (select public.jwt_app_role()) = 'admin'
  );

-- Lesson content requires an enrollment in the course or trusted admin access.
drop policy if exists lessons_published_read on public.course_lessons;
create policy lessons_enrolled_or_admin_read
  on public.course_lessons for select to authenticated
  using (
    exists (
      select 1 from public.course_enrollments e
      where e.course_id = course_lessons.course_id
        and e.user_id = (select auth.uid())
    )
    or (select public.jwt_app_role()) = 'admin'
  );
