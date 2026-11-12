import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../../harness/createRuleScenario'

describe('rule change grants', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.queryDatabase('select * from public.request_rule_removal($1)', [scenario.ruleId])

  const hasTablePrivilege = async (privilege: string, table: string) =>
    (
      await scenario.queryDatabase<{ allowed: boolean }>(
        'select has_table_privilege(current_user, $1, $2) as allowed',
        [`public.${table}`, privilege],
      )
    ).rows[0]?.allowed

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('denies direct updates and deletes on rules', async () => {
    await expect(
      scenario.queryDatabase("update public.block_rules set mode = 'schedule'"),
    ).rejects.toThrow(/permission denied/)
    await expect(scenario.queryDatabase('delete from public.block_rules')).rejects.toThrow(
      /permission denied/,
    )
    expect((await scenario.readRules())[0]?.mode).toBe('always')
  })

  it('does not grant table privileges that would bypass the cooldown', async () => {
    expect(await hasTablePrivilege('UPDATE', 'block_rules')).toBe(false)
    expect(await hasTablePrivilege('DELETE', 'block_rules')).toBe(false)
    expect(await hasTablePrivilege('INSERT', 'rule_change_requests')).toBe(false)
    expect(await hasTablePrivilege('UPDATE', 'rule_change_requests')).toBe(false)
    expect(await hasTablePrivilege('UPDATE', 'profiles')).toBe(false)
  })

  it('does not let users change their own cooldown', async () => {
    await expect(
      scenario.queryDatabase('update public.profiles set cooldown_hours = 0'),
    ).rejects.toThrow(/permission denied/)
  })

  it('does not let users forge change requests directly', async () => {
    await expect(
      scenario.queryDatabase(
        `insert into public.rule_change_requests (rule_id, kind, effective_at)
         values ($1, 'delete', now())`,
        [scenario.ruleId],
      ),
    ).rejects.toThrow(/permission denied/)
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
      scenario.queryDatabase('select public.apply_due_changes_for($1)', [scenario.alice]),
    ).rejects.toThrow(/permission denied/)
    await expect(
      scenario.queryDatabase('select public.apply_all_due_rule_changes()'),
    ).rejects.toThrow(/permission denied/)
  })
})
