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
