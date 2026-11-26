-- CLINA initial platform schema
-- Sensitive clinical data is isolated by row-level security. Never use user_metadata for roles.
create extension if not exists pgcrypto;

create type public.app_role as enum ('patient', 'professional', 'admin');
create type public.appointment_status as enum ('requested', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded', 'cancelled');
create type public.professional_status as enum ('pending', 'approved', 'rejected', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.app_role not null default 'patient',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professional_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  public_name text not null,
  category text not null check (category in ('Psicologia', 'Psiquiatria', 'Psicanálise')),
  registration_type text not null,
  registration_number text not null,
  biography text,
  specialties text[] not null default '{}',
  session_price_cents integer not null check (session_price_cents > 0),
  session_duration_minutes integer not null default 50 check (session_duration_minutes between 20 and 180),
  status public.professional_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles(user_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  unique (professional_id, starts_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.professional_profiles(user_id),
  slot_id uuid references public.availability_slots(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'requested',
  price_cents integer not null check (price_cents > 0),
  meeting_url text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.clinical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.professional_profiles(user_id),
  appointment_id uuid references public.appointments(id),
  record_type text not null check (record_type in ('note', 'assessment', 'plan', 'document')),
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.emotional_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  mood smallint not null check (mood between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id),
  customer_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.professional_profiles(user_id),
  provider text not null default 'asaas',
  provider_payment_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  platform_fee_cents integer not null check (platform_fee_cents >= 0),
  professional_amount_cents integer not null check (professional_amount_cents >= 0),
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  check (platform_fee_cents + professional_amount_cents = amount_cents)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  plan_code text not null check (plan_code in ('free', 'premium', 'clina_plus')),
  provider text not null default 'asaas',
  provider_subscription_id text unique,
  status text not null check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  published boolean not null default false,
  passing_score numeric(5,2) not null default 70 check (passing_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content_url text,
  position integer not null default 0,
  unique (course_id, position)
);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id),
  user_id uuid not null references public.profiles(id),
  progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create table public.course_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  score numeric(5,2) not null check (score between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.course_enrollments(id),
  certificate_code text not null unique default encode(gen_random_bytes(12), 'hex'),
  issued_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index appointments_patient_start_idx on public.appointments(patient_id, starts_at desc);
create index appointments_professional_start_idx on public.appointments(professional_id, starts_at desc);
create index clinical_records_patient_idx on public.clinical_records(patient_id, created_at desc);
create index emotional_entries_patient_idx on public.emotional_entries(patient_id, created_at desc);
create index payments_customer_idx on public.payments(customer_id, created_at desc);
create index course_enrollments_user_idx on public.course_enrollments(user_id);

-- Roles must be assigned by trusted server-side code in auth.app_metadata, never user-editable user_metadata.
create or replace function public.jwt_app_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'patient');
$$;

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.clinical_records enable row level security;
alter table public.emotional_entries enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.courses enable row level security;
alter table public.course_lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.course_attempts enable row level security;
alter table public.certificates enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');
create function public.guard_profile_role_change()
returns trigger language plpgsql set search_path = ''
as $clina_guard$
begin
  if new.role is distinct from old.role then
    raise exception 'Profile role can only be changed by trusted server-side code';
  end if;
  return new;
end;
$clina_guard$;
revoke all on function public.guard_profile_role_change() from public, anon, authenticated;
create trigger profiles_guard_role
before update on public.profiles
for each row execute function public.guard_profile_role_change();

create policy "profiles_update_self" on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "professionals_public_approved" on public.professional_profiles for select to anon, authenticated
using (status = 'approved' or user_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');
create policy "professionals_insert_self" on public.professional_profiles for insert to authenticated
with check (user_id = (select auth.uid()) and (select public.jwt_app_role()) = 'professional');
create function public.guard_professional_approval()
returns trigger language plpgsql set search_path = ''
as $clina_guard$
begin
  if new.status is distinct from old.status or new.reviewed_at is distinct from old.reviewed_at then
    raise exception 'Professional approval fields can only be changed by trusted server-side code';
  end if;
  return new;
end;
$clina_guard$;
revoke all on function public.guard_professional_approval() from public, anon, authenticated;
create trigger professional_profiles_guard_approval
before update on public.professional_profiles
for each row execute function public.guard_professional_approval();

create policy "professionals_update_self_or_admin" on public.professional_profiles for update to authenticated
using (user_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin')
with check (user_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');

create policy "availability_public_read" on public.availability_slots for select to anon, authenticated
using (is_available or professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');
create policy "availability_professional_manage" on public.availability_slots for all to authenticated
using (professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin')
with check (professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');

create policy "appointments_participants_read" on public.appointments for select to authenticated
using (patient_id = (select auth.uid()) or professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');
-- Appointment writes are intentionally server-only. A trusted booking endpoint must
-- lock the availability slot, validate the approved professional and price, then insert atomically.

create policy "clinical_records_participants_read" on public.clinical_records for select to authenticated
using (
  professional_id = (select auth.uid())
  or (patient_id = (select auth.uid()) and professional_id in (
    select a.professional_id from public.appointments a
    where a.patient_id = (select auth.uid()) and a.professional_id = clinical_records.professional_id
  ))
  or (select public.jwt_app_role()) = 'admin'
);
create policy "clinical_records_professional_insert" on public.clinical_records for insert to authenticated
with check (professional_id = (select auth.uid()) and (select public.jwt_app_role()) = 'professional');
create policy "clinical_records_professional_update" on public.clinical_records for update to authenticated
using (professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin')
with check (professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');

create policy "emotional_entries_owner" on public.emotional_entries for all to authenticated
using (patient_id = (select auth.uid()))
with check (patient_id = (select auth.uid()));

create policy "payments_participants_read" on public.payments for select to authenticated
using (customer_id = (select auth.uid()) or professional_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');

create policy "subscriptions_owner_read" on public.subscriptions for select to authenticated
using (user_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');

create policy "courses_published_read" on public.courses for select to anon, authenticated
using (published or (select public.jwt_app_role()) = 'admin');
create policy "lessons_published_read" on public.course_lessons for select to anon, authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.published)
  or (select public.jwt_app_role()) = 'admin'
);
create policy "enrollments_owner_read" on public.course_enrollments for select to authenticated
using (user_id = (select auth.uid()) or (select public.jwt_app_role()) = 'admin');
create policy "attempts_owner_read" on public.course_attempts for select to authenticated
using (exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())) or (select public.jwt_app_role()) = 'admin');
create policy "certificates_owner_read" on public.certificates for select to authenticated
using (exists (select 1 from public.course_enrollments e where e.id = enrollment_id and e.user_id = (select auth.uid())) or (select public.jwt_app_role()) = 'admin');

-- Explicit grants: Supabase's current Data API defaults no longer expose new tables automatically.
grant select on public.professional_profiles, public.availability_slots, public.courses, public.course_lessons to anon, authenticated;
grant select on public.profiles, public.appointments, public.clinical_records, public.emotional_entries,
  public.payments, public.subscriptions, public.course_enrollments, public.course_attempts, public.certificates to authenticated;
grant update on public.profiles to authenticated;
grant insert, update, delete on public.emotional_entries to authenticated;
grant insert, update on public.professional_profiles to authenticated;
grant insert, update, delete on public.availability_slots to authenticated;

-- Clinical, financial, appointment, subscription, and course mutations are server-only.
revoke insert, update, delete on public.appointments, public.clinical_records, public.payments,
  public.subscriptions, public.courses, public.course_lessons, public.course_enrollments,
  public.course_attempts, public.certificates from anon, authenticated;
revoke all on public.audit_logs from anon, authenticated;
