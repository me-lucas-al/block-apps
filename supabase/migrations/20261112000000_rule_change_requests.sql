alter table public.profiles
  add column cooldown_hours integer not null default 24
  check (cooldown_hours between 0 and 168);

create function public.are_valid_windows(p_windows jsonb) returns boolean
language sql immutable as $$
  select jsonb_typeof(p_windows) = 'array'
    and not jsonb_path_exists(
      p_windows,
      '$[*] ? (!(
        @.type() == "object"
        && @.days.type() == "array"
        && @.days.size() > 0
        && !exists(@.days[*] ? (@.type() != "number" || @ < 0 || @ > 6))
        && @.start.type() == "string"
        && @.end.type() == "string"
        && @.start like_regex "^([01][0-9]|2[0-3]):[0-5][0-9]$"
        && @.end like_regex "^([01][0-9]|2[0-3]):[0-5][0-9]$"
      ))'
    )
$$;

alter table public.block_rules
  add constraint block_rules_windows_valid check (public.are_valid_windows(windows));

create table public.rule_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  rule_id uuid not null unique references public.block_rules (id) on delete cascade,
  kind text not null check (kind in ('update', 'delete')),
  mode text check (mode in ('always', 'schedule')),
  windows jsonb,
  effective_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint rule_change_requests_payload_matches_kind check (
    (kind = 'delete' and mode is null and windows is null)
    or (kind = 'update' and mode is not null and public.are_valid_windows(windows))
  )
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

revoke all on public.profiles, public.block_rules, public.rule_change_requests, public.devices
  from anon;
revoke update, delete on public.block_rules from authenticated;
revoke insert, update on public.rule_change_requests from authenticated;
revoke insert, update, delete on public.profiles from authenticated;
