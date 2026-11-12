import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../../harness/createRuleScenario'

describe('rule change ownership', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.queryDatabase('select * from public.request_rule_removal($1)', [scenario.ruleId])

  const visiblePendingRequests = async () =>
    (await scenario.queryDatabase('select id from public.rule_change_requests')).rows

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('lets the owner cancel a pending change', async () => {
    await requestRemoval()
    await scenario.queryDatabase('delete from public.rule_change_requests')
    expect(await visiblePendingRequests()).toEqual([])
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('does not let another user see or cancel a pending change', async () => {
    await requestRemoval()
    await scenario.actAs(scenario.bob)
    expect(await visiblePendingRequests()).toEqual([])
    const cancellation = await scenario.queryDatabase('delete from public.rule_change_requests')
    expect(cancellation.affectedRows).toBe(0)
    await scenario.actAs(scenario.alice)
    expect(await visiblePendingRequests()).toHaveLength(1)
  })

  it('rejects change requests for rules owned by someone else', async () => {
    await scenario.actAs(scenario.bob)
    await expect(requestRemoval()).rejects.toThrow(/Rule not found/)
    await expect(
      scenario.queryDatabase('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'always',
        '[]',
      ]),
    ).rejects.toThrow(/Rule not found/)
  })
})
