alter table public.block_rules
  drop constraint block_rules_target_type_check;

alter table public.block_rules
  add constraint block_rules_target_type_check
  check (target_type in ('app', 'site', 'keyword'));
