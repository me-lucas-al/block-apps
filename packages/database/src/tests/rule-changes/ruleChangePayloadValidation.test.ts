import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../../harness/createRuleScenario'

describe('rule change payload validation', () => {
  let scenario: RuleScenario

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('rejects update requests whose windows are not a list of valid windows', async () => {
    await expect(
      scenario.queryDatabase('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'schedule',
        '{}',
      ]),
    ).rejects.toThrow(/payload_matches_kind/)
  })

  it('rejects update requests with an unknown mode', async () => {
    await expect(
      scenario.queryDatabase('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'sometimes',
        '[]',
      ]),
    ).rejects.toThrow()
  })

  it('keeps the rule unchanged after a rejected request', async () => {
    await scenario
      .queryDatabase('select * from public.request_rule_update($1, $2, $3::jsonb)', [
        scenario.ruleId,
        'schedule',
        '{}',
      ])
      .catch(() => undefined)
    expect((await scenario.readRules())[0]?.mode).toBe('always')
    expect((await scenario.queryDatabase('select id from public.rule_change_requests')).rows).toEqual([])
  })
})
