create type public.insight_app_role as enum ('admin', 'user');

create table if not exists public.insight_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.insight_user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.insight_app_role not null,
  created_at timestamptz not null default now()
);

alter table public.insight_profiles enable row level security;
alter table public.insight_user_roles enable row level security;

grant select, insert, update on public.insight_profiles to authenticated;
grant select on public.insight_user_roles to authenticated;

create policy "insight_profiles_select_own"
on public.insight_profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "insight_profiles_insert_own"
on public.insight_profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "insight_profiles_update_own"
on public.insight_profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "insight_user_roles_select_own"
on public.insight_user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);
