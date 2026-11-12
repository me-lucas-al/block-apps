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
language plpgsql stable set search_path = public as $$
begin
  if not exists (
    select 1 from public.block_rules where id = p_rule_id and user_id = p_user_id
  ) then
    raise exception 'Rule not found' using errcode = 'P0002';
  end if;
end;
$$;

create function public.cooldown_deadline(p_user_id uuid) returns timestamptz
language sql stable set search_path = public as $$
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

create function public.apply_all_due_rule_changes() returns integer
language sql security definer set search_path = public as $$
  select coalesce(sum(public.apply_due_changes_for(user_id)), 0)::integer
  from (
    select distinct user_id from public.rule_change_requests where effective_at <= now()
  ) due
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

  select * into v_request from public.rule_change_requests where rule_id = p_rule_id;
  if found and v_request.kind = 'update'
    and v_request.mode = p_mode and v_request.windows = p_windows then
    return v_request;
  end if;

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

  select * into v_request from public.rule_change_requests where rule_id = p_rule_id;
  if found and v_request.kind = 'delete' then
    return v_request;
  end if;

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
