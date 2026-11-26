-- CLINA backend security and transactional workflows.
-- Apply only after reviewing the target project ref. This migration is additive and preserves existing records.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Extend the existing professional profile with public directory attributes.
alter table public.professional_profiles
  add column if not exists registration_state char(2),
  add column if not exists approaches text[] not null default '{}',
  add column if not exists audiences text[] not null default '{}',
  add column if not exists rating numeric(2,1),
  add column if not exists reviews_count integer not null default 0,
  add column if not exists rejection_reason text,
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists updated_at timestamptz not null default now();

-- Existing clinical_records is renamed to the product's requested medical_records table.
do $$
begin
  if to_regclass('public.medical_records') is null and to_regclass('public.clinical_records') is not null then
    alter table public.clinical_records rename to medical_records;
  end if;
end $$;

-- Normalize the emotional diary schema without creating synthetic entries.
alter table public.emotional_entries
  add column if not exists entry_date date not null default (now() at time zone 'America/Sao_Paulo')::date,
  add column if not exists emoji text,
  add column if not exists updated_at timestamptz not null default now();

-- Enforce one entry per patient/day.
create unique index if not exists emotional_entries_patient_day_uidx
  on public.emotional_entries(patient_id, entry_date);

-- Store video room URL only on server-created appointments.
alter table public.appointments
  add column if not exists telehealth_room_url text;

-- Transactions are the canonical immutable 20/80 ledger.
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id),
  patient_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.professional_profiles(user_id),
  gross_amount_cents integer not null check (gross_amount_cents >= 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  professional_payout_cents integer not null check (professional_payout_cents >= 0),
  payout_status text not null default 'pending' check (payout_status in ('pending','processing','paid','failed','reversed')),
  created_at timestamptz not null default now(),
  check (platform_fee_cents + professional_payout_cents = gross_amount_cents),
  check (platform_fee_cents = round(gross_amount_cents * 0.20)::integer)
);

create index if not exists transactions_professional_created_idx
  on public.transactions(professional_id, created_at desc);
create index if not exists transactions_patient_created_idx
  on public.transactions(patient_id, created_at desc);

-- Ensure all public tables continue to use RLS.
alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;
alter table public.emotional_entries enable row level security;
alter table public.payments enable row level security;
alter table public.transactions enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: users may only read/update their own basic profile. Role is immutable from client.
drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Public directory only shows approved profiles. Owners can read their own application.
drop policy if exists professionals_public_approved on public.professional_profiles;
drop policy if exists professionals_update_self_or_admin on public.professional_profiles;
drop policy if exists professionals_insert_self on public.professional_profiles;
create policy professionals_public_approved on public.professional_profiles
  for select to anon, authenticated using (status = 'approved');
create policy professionals_owner_read on public.professional_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy professionals_owner_insert on public.professional_profiles
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'patient'
  );
create policy professionals_owner_update_pending on public.professional_profiles
  for update to authenticated using (
    user_id = (select auth.uid()) and status in ('pending','rejected')
  ) with check (
    user_id = (select auth.uid()) and status in ('pending','rejected')
  );

-- Admin validation is performed only through the dedicated RPC below.
create policy professionals_admin_read_pending on public.professional_profiles
  for select to authenticated using (
    (select p.role from public.profiles p where p.id = (select auth.uid())) = 'admin'
  );

-- Availability: public reads only future open slots of approved professionals.
drop policy if exists availability_public_read on public.availability_slots;
drop policy if exists availability_professional_manage on public.availability_slots;
drop policy if exists availability_professional_insert on public.availability_slots;
drop policy if exists availability_professional_update on public.availability_slots;
drop policy if exists availability_professional_delete on public.availability_slots;
create policy availability_public_read on public.availability_slots
  for select to anon, authenticated using (
    is_available = true and starts_at > now()
    and exists (select 1 from public.professional_profiles p
      where p.user_id = professional_id and p.status = 'approved')
  );
create policy availability_owner_read on public.availability_slots
  for select to authenticated using (professional_id = (select auth.uid()));
create policy availability_owner_insert on public.availability_slots
  for insert to authenticated with check (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
    and exists (select 1 from public.professional_profiles p
      where p.user_id = (select auth.uid()) and p.status = 'approved')
  );
create policy availability_owner_update on public.availability_slots
  for update to authenticated using (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
    and exists (select 1 from public.professional_profiles p
      where p.user_id = (select auth.uid()) and p.status = 'approved')
  ) with check (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
    and exists (select 1 from public.professional_profiles p
      where p.user_id = (select auth.uid()) and p.status = 'approved')
  );
create policy availability_owner_delete on public.availability_slots
  for delete to authenticated using (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
  );

-- Appointments: patient and assigned professional can see their own appointment. Admin can see
-- operational metadata, but never clinical notes.
drop policy if exists appointments_participants_read on public.appointments;
create policy appointments_participants_read on public.appointments
  for select to authenticated using (
    patient_id = (select auth.uid()) or professional_id = (select auth.uid())
    or (select p.role from public.profiles p where p.id = (select auth.uid())) = 'admin'
  );
revoke insert, update, delete on public.appointments from anon, authenticated;
grant select on public.appointments to authenticated;

-- Strict clinical confidentiality: no patient or admin policy exists.
drop policy if exists clinical_records_participants_read on public.medical_records;
drop policy if exists clinical_records_professional_insert on public.medical_records;
drop policy if exists clinical_records_professional_update on public.medical_records;
drop policy if exists medical_records_professional_only on public.medical_records;
create policy medical_records_assigned_professional_only on public.medical_records
  for all to authenticated
  using (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
    and exists (select 1 from public.appointments a
      where a.id = appointment_id and a.professional_id = (select auth.uid()))
  )
  with check (
    professional_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'professional'
    and exists (select 1 from public.appointments a
      where a.id = appointment_id and a.professional_id = (select auth.uid()))
  );
revoke all on public.medical_records from anon, authenticated;
grant select, insert, update on public.medical_records to authenticated;

-- Emotional diary is exclusively owned by the patient; no professional/admin override.
drop policy if exists emotional_entries_owner on public.emotional_entries;
create policy emotional_entries_patient_only on public.emotional_entries
  for all to authenticated
  using (
    patient_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'patient'
  )
  with check (
    patient_id = (select auth.uid())
    and (select p.role from public.profiles p where p.id = (select auth.uid())) = 'patient'
  );

-- No client-side financial writes. Only the trusted payment webhook/service can write.
drop policy if exists payments_participants_read on public.payments;
create policy payments_participants_read on public.payments
  for select to authenticated using (
    customer_id = (select auth.uid()) or professional_id = (select auth.uid())
    or (select p.role from public.profiles p where p.id = (select auth.uid())) = 'admin'
  );
alter table public.transactions enable row level security;
create policy transactions_participant_read on public.transactions
  for select to authenticated using (
    patient_id = (select auth.uid()) or professional_id = (select auth.uid())
    or (select p.role from public.profiles p where p.id = (select auth.uid())) = 'admin'
  );

-- No client role may read or write audit logs.
revoke all on public.audit_logs from anon, authenticated;
revoke all on public.transactions from anon, authenticated;
grant select on public.transactions to authenticated;

-- Limit profile updates to non-privileged columns.
revoke update on public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;

-- No browser client can set payment status, payout split, appointment price, or meeting URL.
revoke insert, update, delete on public.payments from anon, authenticated;
revoke insert, update, delete on public.transactions from anon, authenticated;
revoke update on public.appointments from anon, authenticated;

-- Atomic booking function: lock slot, verify patient and approved professional, derive price server-side.
create or replace function public.book_clina_appointment(p_slot_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_slot public.availability_slots%rowtype;
  v_price integer;
  v_duration integer;
  v_appointment uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles p where p.id = v_user and p.role = 'patient') then
    raise exception 'Only patient accounts can book';
  end if;

  select * into v_slot from public.availability_slots
    where id = p_slot_id for update;
  if not found or not v_slot.is_available or v_slot.starts_at <= now() then
    raise exception 'This time slot is no longer available';
  end if;

  select session_price_cents, session_duration_minutes into v_price, v_duration
    from public.professional_profiles
    where user_id = v_slot.professional_id and status = 'approved';
  if v_price is null then raise exception 'Professional is not approved'; end if;

  update public.availability_slots set is_available = false where id = p_slot_id;
  insert into public.appointments(patient_id, professional_id, slot_id, starts_at, ends_at, status, price_cents)
    values (v_user, v_slot.professional_id, v_slot.id, v_slot.starts_at,
      greatest(v_slot.ends_at, v_slot.starts_at + make_interval(mins => v_duration)),
      'confirmed', v_price)
    returning id into v_appointment;
  return v_appointment;
end;
$$;
revoke all on function public.book_clina_appointment(uuid) from public, anon;
grant execute on function public.book_clina_appointment(uuid) to authenticated;

-- Admin-only professional validation. Admin role is read from the protected profiles table.
create or replace function public.review_clina_professional(
  p_professional_id uuid, p_approved boolean, p_rejection_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null or not exists (
    select 1 from public.profiles p where p.id = v_actor and p.role = 'admin'
  ) then raise exception 'Administrator role required'; end if;

  update public.professional_profiles
    set status = case when p_approved then 'approved'::public.professional_status else 'rejected'::public.professional_status end,
        reviewed_at = now(), reviewed_by = v_actor,
        rejection_reason = case when p_approved then null else left(coalesce(p_rejection_reason,''),1000) end
    where user_id = p_professional_id;
  if not found then raise exception 'Professional application not found'; end if;

  if p_approved then
    update public.profiles set role = 'professional' where id = p_professional_id;
  end if;

  insert into public.audit_logs(actor_id,action,resource_type,resource_id,metadata)
    values (v_actor, case when p_approved then 'professional_approved' else 'professional_rejected' end,
      'professional_profile', p_professional_id::text,
      jsonb_build_object('reason', case when p_approved then null else left(coalesce(p_rejection_reason,''),1000) end));
end;
$$;
revoke all on function public.review_clina_professional(uuid,boolean,text) from public, anon;
grant execute on function public.review_clina_professional(uuid,boolean,text) to authenticated;

-- Keep SECURITY DEFINER RPCs callable only by authenticated users and check auth.uid() in-body.
