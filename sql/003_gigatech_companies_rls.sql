grant select on table public.gigatech_clientes_config to authenticated;

drop policy if exists "insight_select_companies_by_scope" on public.gigatech_clientes_config;

create policy "insight_select_companies_by_scope"
on public.gigatech_clientes_config
for select
to authenticated
using (
  ativo = true
  and (
    exists (
      select 1
      from public.insight_user_roles roles
      where roles.user_id = auth.uid()
        and roles.role = 'admin'
    )
    or id = (
      select profiles.empresa_id
      from public.insight_profiles profiles
      where profiles.id = auth.uid()
    )
  )
);
