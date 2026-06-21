-- Vincula usuarios ja existentes em auth.users ao acesso do Score Insight.
-- Ajuste os nomes e papeis conforme a sua operacao.

insert into public.insight_profiles (id, email, full_name, active)
select
  id,
  email,
  'Diego Score' as full_name,
  true as active
from auth.users
where email = 'diego@score.com.br'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  active = excluded.active,
  updated_at = now();

insert into public.insight_user_roles (user_id, role)
select
  id,
  'admin'::public.insight_app_role
from auth.users
where email = 'diego@score.com.br'
  and not exists (
    select 1
    from public.insight_user_roles r
    where r.user_id = auth.users.id
      and r.role = 'admin'::public.insight_app_role
  );

insert into public.insight_profiles (id, email, full_name, active)
select
  id,
  email,
  'Lucas Score' as full_name,
  true as active
from auth.users
where email = 'lucas@email.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  active = excluded.active,
  updated_at = now();

insert into public.insight_user_roles (user_id, role)
select
  id,
  'user'::public.insight_app_role
from auth.users
where email = 'lucas@email.com'
  and not exists (
    select 1
    from public.insight_user_roles r
    where r.user_id = auth.users.id
      and r.role = 'user'::public.insight_app_role
  );
