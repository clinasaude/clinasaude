-- CLINA: persistent patient evaluations with strict ownership.
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete restrict,
  patient_id uuid not null references public.profiles(id) on delete restrict,
  professional_id uuid not null references public.profiles(id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text null check (comment is null or char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists evaluations_professional_created_idx
  on public.evaluations (professional_id, created_at desc);

alter table public.evaluations enable row level security;

drop policy if exists evaluations_patient_read_own on public.evaluations;
create policy evaluations_patient_read_own
  on public.evaluations for select to authenticated
  using (patient_id = (select auth.uid()));

drop policy if exists evaluations_patient_create_completed_appointment on public.evaluations;
create policy evaluations_patient_create_completed_appointment
  on public.evaluations for insert to authenticated
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

revoke all on public.evaluations from anon, public;
grant select, insert on public.evaluations to authenticated;

comment on table public.evaluations is
  'Avaliações de consultas concluídas. Comentários não devem conter dados clínicos ou sensíveis.';
comment on column public.evaluations.comment is
  'Comentário opcional, limitado a 2000 caracteres; não publicar sem moderação e base legal.';
