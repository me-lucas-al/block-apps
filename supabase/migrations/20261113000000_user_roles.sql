alter table public.profiles
  add column role text not null default 'user' check (role in ('user', 'admin')),
  add column display_name text check (display_name is null or length(display_name) <= 80),
  add column must_change_password boolean not null default false;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  )
$$;

create function public.acknowledge_password_change() returns void
language sql security definer set search_path = public as $$
  update public.profiles
  set must_change_password = false
  where id = public.require_authenticated_user()
$$;

create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

grant update (display_name) on public.profiles to authenticated;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.acknowledge_password_change() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.acknowledge_password_change() to authenticated;
