-- Permit only trusted database/server identities to assign roles or approve professionals.
create or replace function public.guard_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $clina_guard$
begin
  if new.role is distinct from old.role
     and current_user not in ('postgres', 'service_role') then
    raise exception 'Profile role can only be changed by trusted server-side code';
  end if;
  return new;
end;
$clina_guard$;

create or replace function public.guard_professional_approval()
returns trigger
language plpgsql
set search_path = ''
as $clina_guard$
begin
  if (new.status is distinct from old.status or new.reviewed_at is distinct from old.reviewed_at)
     and current_user not in ('postgres', 'service_role') then
    raise exception 'Professional approval fields can only be changed by trusted server-side code';
  end if;
  return new;
end;
$clina_guard$;

revoke all on function public.guard_profile_role_change() from public, anon, authenticated;
revoke all on function public.guard_professional_approval() from public, anon, authenticated;
