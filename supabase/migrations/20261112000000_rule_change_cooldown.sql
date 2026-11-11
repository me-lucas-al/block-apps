alter table public.profiles
  add column cooldown_hours integer not null default 24
  check (cooldown_hours between 0 and 168);

create table public.rule_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rule_id uuid not null unique references public.block_rules (id) on delete cascade,
  kind text not null check (kind in ('update', 'delete')),
  mode text check (mode in ('always', 'schedule')),
  windows jsonb,
  effective_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (kind = 'delete' or (mode is not null and windows is not null))
);

create index rule_change_requests_user_id_idx on public.rule_change_requests (user_id);
create index rule_change_requests_effective_at_idx on public.rule_change_requests (effective_at);

alter table public.rule_change_requests enable row level security;

create policy rule_change_requests_select_own on public.rule_change_requests
  for select using (user_id = auth.uid());

create policy rule_change_requests_cancel_own on public.rule_change_requests
  for delete using (user_id = auth.uid());

drop policy block_rules_owner_all on public.block_rules;

create policy block_rules_select_own on public.block_rules
  for select using (user_id = auth.uid());

create policy block_rules_insert_own on public.block_rules
  for insert with check (user_id = auth.uid());

create function public.require_authenticated_user() returns uuid
language plpgsql stable as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  return auth.uid();
end;
$$;

create function public.assert_rule_owner(p_rule_id uuid, p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.block_rules where id = p_rule_id and user_id = p_user_id
  ) then
    raise exception 'Rule not found' using errcode = 'P0002';
  end if;
end;
$$;

create function public.cooldown_deadline(p_user_id uuid) returns timestamptz
language sql stable security definer set search_path = public as $$
  select now() + make_interval(hours => cooldown_hours)
  from public.profiles
  where id = p_user_id
$$;

create function public.apply_due_changes_for(p_user_id uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_request public.rule_change_requests;
  v_applied integer := 0;
begin
  for v_request in
    select * from public.rule_change_requests
    where user_id = p_user_id and effective_at <= now()
    order by effective_at
    for update
  loop
    if v_request.kind = 'delete' then
      delete from public.block_rules where id = v_request.rule_id;
    else
      update public.block_rules
      set mode = v_request.mode, windows = v_request.windows
      where id = v_request.rule_id;
      delete from public.rule_change_requests where id = v_request.id;
    end if;
    v_applied := v_applied + 1;
  end loop;
  return v_applied;
end;
$$;

create function public.apply_due_rule_changes() returns integer
language sql security definer set search_path = public as $$
  select public.apply_due_changes_for(public.require_authenticated_user())
$$;

create function public.request_rule_update(
  p_rule_id uuid,
  p_mode text,
  p_windows jsonb
) returns public.rule_change_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := public.require_authenticated_user();
  v_request public.rule_change_requests;
begin
  perform public.assert_rule_owner(p_rule_id, v_user_id);

  insert into public.rule_change_requests (user_id, rule_id, kind, mode, windows, effective_at)
  values (v_user_id, p_rule_id, 'update', p_mode, p_windows, public.cooldown_deadline(v_user_id))
  on conflict (rule_id) do update
    set kind = 'update',
        mode = excluded.mode,
        windows = excluded.windows,
        effective_at = excluded.effective_at,
        created_at = now()
  returning * into v_request;

  perform public.apply_due_changes_for(v_user_id);
  return v_request;
end;
$$;

create function public.request_rule_removal(p_rule_id uuid)
returns public.rule_change_requests
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := public.require_authenticated_user();
  v_request public.rule_change_requests;
begin
  perform public.assert_rule_owner(p_rule_id, v_user_id);

  insert into public.rule_change_requests (user_id, rule_id, kind, mode, windows, effective_at)
  values (v_user_id, p_rule_id, 'delete', null, null, public.cooldown_deadline(v_user_id))
  on conflict (rule_id) do update
    set kind = 'delete',
        mode = null,
        windows = null,
        effective_at = excluded.effective_at,
        created_at = now()
  returning * into v_request;

  perform public.apply_due_changes_for(v_user_id);
  return v_request;
end;
$$;

create function public.apply_all_due_rule_changes() returns integer
language sql security definer set search_path = public as $$
  select coalesce(sum(public.apply_due_changes_for(user_id)), 0)::integer
  from (
    select distinct user_id from public.rule_change_requests where effective_at <= now()
  ) due
$$;

revoke all on function public.require_authenticated_user() from public, anon, authenticated;
revoke all on function public.assert_rule_owner(uuid, uuid) from public, anon, authenticated;
revoke all on function public.cooldown_deadline(uuid) from public, anon, authenticated;
revoke all on function public.apply_due_changes_for(uuid) from public, anon, authenticated;
revoke all on function public.apply_all_due_rule_changes() from public, anon, authenticated;
revoke all on function public.apply_due_rule_changes() from public, anon;
revoke all on function public.request_rule_update(uuid, text, jsonb) from public, anon;
revoke all on function public.request_rule_removal(uuid) from public, anon;

grant execute on function public.apply_due_rule_changes() to authenticated;
grant execute on function public.request_rule_update(uuid, text, jsonb) to authenticated;
grant execute on function public.request_rule_removal(uuid) to authenticated;
