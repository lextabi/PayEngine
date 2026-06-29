-- Phase 2 Auth Bootstrap for PayEngine
-- Run this in Supabase SQL Editor.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum (
      'ADMIN',
      'PAYROLL_MANAGER',
      'PAYROLL_STAFF',
      'EMPLOYEE'
    );
  end if;
end
$$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'EMPLOYEE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_roles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
before update on public.user_roles
for each row
execute function public.set_user_roles_updated_at();

alter table public.user_roles enable row level security;

-- Users can read only their own role.
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Service role can manage all records.
drop policy if exists "user_roles_service_all" on public.user_roles;
create policy "user_roles_service_all"
on public.user_roles
for all
to service_role
using (true)
with check (true);
