-- CLINA: avaliações verificadas e nomes de domínio em português.
-- Views usam security_invoker para preservar RLS das tabelas base.
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists evaluations_professional_public_idx
  on public.evaluations (professional_id, created_at desc) where is_public = true;
alter table public.evaluations enable row level security;
revoke all on public.evaluations from anon, authenticated;
grant select, insert, update on public.evaluations to authenticated;

drop policy if exists evaluations_patient_read_own on public.evaluations;
create policy evaluations_patient_read_own on public.evaluations
for select to authenticated
using (patient_id = (select auth.uid()));

drop policy if exists evaluations_patient_insert_completed_appointment on public.evaluations;
create policy evaluations_patient_insert_completed_appointment on public.evaluations
for insert to authenticated
with check (
  patient_id = (select auth.uid())
  and exists (
    select 1 from public.appointments a
    where a.id = appointment_id
      and a.patient_id = (select auth.uid())
      and a.professional_id = evaluations.professional_id
      and a.status::text = 'completed'
  )
);

drop policy if exists evaluations_patient_update_own on public.evaluations;
create policy evaluations_patient_update_own on public.evaluations
for update to authenticated
using (patient_id = (select auth.uid()))
with check (patient_id = (select auth.uid()));

drop policy if exists evaluations_public_read on public.evaluations;
create policy evaluations_public_read on public.evaluations
for select to anon, authenticated
using (is_public = true);

-- Nomes de domínio solicitados: views somente leitura, respeitando as policies das tabelas base.
create or replace view public.perfis with (security_invoker = true) as
  select id, full_name, phone, role, avatar_url, created_at, updated_at from public.profiles;
create or replace view public.agendamentos with (security_invoker = true) as
  select id, patient_id, professional_id, slot_id, starts_at, ends_at, status,
         price_cents, meeting_url, telehealth_room_url, created_at, updated_at
  from public.appointments;
create or replace view public.prontuarios with (security_invoker = true) as
  select id, patient_id, professional_id, appointment_id, record_type, title, content, created_at, updated_at
  from public.medical_records;
create or replace view public.diario_emocional with (security_invoker = true) as
  select id, patient_id, mood, note, entry_date, emoji, created_at, updated_at
  from public.emotional_entries;
create or replace view public.avaliacoes with (security_invoker = true) as
  select id, appointment_id, patient_id, professional_id, rating, comment, is_public, created_at, updated_at
  from public.evaluations;
grant select on public.perfis, public.agendamentos, public.prontuarios,
  public.diario_emocional, public.avaliacoes to authenticated;
grant select on public.avaliacoes to anon;
