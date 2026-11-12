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

create function public.clear_password_change_flag() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set must_change_password = false where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_password_changed
after update of encrypted_password on auth.users
for each row
when (old.encrypted_password is distinct from new.encrypted_password)
execute function public.clear_password_change_flag();

create function public.keep_at_least_one_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.role <> 'admin' or (tg_op = 'UPDATE' and new.role = 'admin') then
    return coalesce(new, old);
  end if;

  perform pg_advisory_xact_lock(hashtext('block_apps_admin_count'));
  if not exists (select 1 from public.profiles where role = 'admin' and id <> old.id) then
    raise exception 'Cannot remove the last admin' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger keep_at_least_one_admin
before update of role or delete on public.profiles
for each row execute function public.keep_at_least_one_admin();

create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

grant update (display_name) on public.profiles to authenticated;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.clear_password_change_flag() from public, anon, authenticated;
revoke all on function public.keep_at_least_one_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;
