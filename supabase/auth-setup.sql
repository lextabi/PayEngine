-- PayEngine personal-auth database policies
-- Run this in Supabase SQL Editor after syncing schema with Prisma.

alter table if exists public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
on public.user_settings
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_settings_service_all" on public.user_settings;
create policy "user_settings_service_all"
on public.user_settings
for all
to service_role
using (true)
with check (true);
