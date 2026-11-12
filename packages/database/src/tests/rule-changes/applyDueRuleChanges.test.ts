import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../../harness/createRuleScenario'

const SCHEDULE_WINDOWS = JSON.stringify([{ days: [1], start: '18:00', end: '20:00' }])

describe('applying due rule changes', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.queryDatabase('select * from public.request_rule_removal($1)', [scenario.ruleId])

  const requestScheduleUpdate = () =>
    scenario.queryDatabase('select * from public.request_rule_update($1, $2, $3::jsonb)', [
      scenario.ruleId,
      'schedule',
      SCHEDULE_WINDOWS,
    ])

  const applyDueChangesOfCaller = async () =>
    (
      await scenario.queryDatabase<{ appliedCount: number }>(
        'select public.apply_due_rule_changes() as "appliedCount"',
      )
    ).rows[0]?.appliedCount

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('does not apply changes before they are due', async () => {
    await requestRemoval()
    expect(await applyDueChangesOfCaller()).toBe(0)
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('removes the rule once the removal is due', async () => {
    await requestRemoval()
    await scenario.expirePendingRequests()
    expect(await applyDueChangesOfCaller()).toBe(1)
    expect(await scenario.readRules()).toEqual([])
  })

  it('applies a scheduled update once it is due', async () => {
    await requestScheduleUpdate()
    expect((await scenario.readRules())[0]?.mode).toBe('always')
    await scenario.expirePendingRequests()
    await applyDueChangesOfCaller()
    const [updatedRule] = await scenario.readRules()
    expect(updatedRule?.mode).toBe('schedule')
    expect(updatedRule?.windows).toEqual(JSON.parse(SCHEDULE_WINDOWS))
  })

  it('applies every due change for all users with the service function', async () => {
    await requestRemoval()
    await scenario.expirePendingRequests()
    await scenario.actAsAdmin()
    const { rows } = await scenario.queryDatabase<{ appliedCount: number }>(
      'select public.apply_all_due_rule_changes() as "appliedCount"',
    )
    expect(rows[0]?.appliedCount).toBe(1)
    expect(await scenario.readRules()).toEqual([])
  })
})
