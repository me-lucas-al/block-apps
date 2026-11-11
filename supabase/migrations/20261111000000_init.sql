create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.block_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('app', 'site')),
  target text not null check (length(trim(target)) > 0),
  mode text not null check (mode in ('always', 'schedule')),
  windows jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_type, target)
);

create index block_rules_user_id_idx on public.block_rules (user_id);

create table public.devices (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'extension')),
  incognito_allowed boolean,
  admin_active boolean,
  last_seen timestamptz not null default now()
);

create index devices_user_id_idx on public.devices (user_id);

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger block_rules_touch_updated_at
before update on public.block_rules
for each row execute function public.touch_updated_at();

create function public.create_profile_for_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.block_rules enable row level security;
alter table public.devices enable row level security;

create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());

create policy block_rules_owner_all on public.block_rules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy devices_owner_all on public.devices
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter publication supabase_realtime add table public.block_rules;
