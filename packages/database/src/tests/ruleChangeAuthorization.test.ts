import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../harness/createRuleScenario'

const NO_WINDOWS = '[]'

describe('rule change authorization', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.query('select * from public.request_rule_removal($1)', [scenario.ruleId])

  const hasPrivilege = async (privilege: string, table: string) =>
    (
      await scenario.query<{ allowed: boolean }>(
        'select has_table_privilege(current_user, $1, $2) as allowed',
        [`public.${table}`, privilege],
      )
    ).rows[0]?.allowed

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('denies direct updates and deletes on rules', async () => {
    await expect(
      scenario.query("update public.block_rules set mode = 'schedule'"),
    ).rejects.toThrow(/permission denied/)
    await expect(scenario.query('delete from public.block_rules')).rejects.toThrow(
      /permission denied/,
    )
    expect((await scenario.readRules())[0]?.mode).toBe('always')
  })

  it('does not grant table privileges that would bypass the cooldown', async () => {
    expect(await hasPrivilege('UPDATE', 'block_rules')).toBe(false)
    expect(await hasPrivilege('DELETE', 'block_rules')).toBe(false)
    expect(await hasPrivilege('INSERT', 'rule_change_requests')).toBe(false)
    expect(await hasPrivilege('UPDATE', 'rule_change_requests')).toBe(false)
    expect(await hasPrivilege('UPDATE', 'profiles')).toBe(false)
  })

  it('does not let users change their own cooldown', async () => {
    await expect(scenario.query('update public.profiles set cooldown_hours = 0')).rejects.toThrow(
      /permission denied/,
    )
  })

  it('does not let users forge change requests directly', async () => {
    await expect(
      scenario.query(
        `insert into public.rule_change_requests (rule_id, kind, effective_at)
         values ($1, 'delete', now())`,
        [scenario.ruleId],
      ),
    ).rejects.toThrow(/permission denied/)
  })

  it('lets the owner cancel a pending change', async () => {
    await requestRemoval()
    await scenario.query('delete from public.rule_change_requests')
    expect((await scenario.query('select id from public.rule_change_requests')).rows).toEqual([])
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('does not let another user see or cancel a pending change', async () => {
    await requestRemoval()
    await scenario.actAs(scenario.bob)
    expect((await scenario.query('select id from public.rule_change_requests')).rows).toEqual([])
    const cancelled = await scenario.query('delete from public.rule_change_requests')
    expect(cancelled.affectedRows).toBe(0)
    await scenario.actAs(scenario.alice)
    expect((await scenario.query('select id from public.rule_change_requests')).rows).toHaveLength(1)
  })

  it('rejects change requests for rules owned by someone else', async () => {
    await scenario.actAs(scenario.bob)
    await expect(requestRemoval()).rejects.toThrow(/Rule not found/)
    await expect(
      scenario.query('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'always',
        NO_WINDOWS,
      ]),
    ).rejects.toThrow(/Rule not found/)
  })

  it('rejects update requests with a malformed payload', async () => {
    await expect(
      scenario.query('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'schedule',
        '{}',
      ]),
    ).rejects.toThrow(/payload_matches_kind/)
  })

  it('denies change requests to anonymous callers', async () => {
    await scenario.actAsAnonymous()
    await expect(requestRemoval()).rejects.toThrow(/permission denied/)
  })

  it('rejects change requests from authenticated callers without a subject', async () => {
    await scenario.actAs('')
    await expect(requestRemoval()).rejects.toThrow(/Not authenticated/)
  })

  it('does not expose the internal functions', async () => {
    await expect(
      scenario.query('select public.apply_due_changes_for($1)', [scenario.alice]),
    ).rejects.toThrow(/permission denied/)
    await expect(scenario.query('select public.apply_all_due_rule_changes()')).rejects.toThrow(
      /permission denied/,
    )
  })
})
