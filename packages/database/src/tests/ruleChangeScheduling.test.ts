import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../harness/createRuleScenario'

const SCHEDULE_WINDOWS = JSON.stringify([{ days: [1], start: '18:00', end: '20:00' }])

type RequestRow = { kind: string; effective_at: Date }

describe('rule change scheduling', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.query<RequestRow>('select kind, effective_at from public.request_rule_removal($1)', [
      scenario.ruleId,
    ])

  const requestUpdate = (mode = 'schedule', windows = SCHEDULE_WINDOWS) =>
    scenario.query<RequestRow>(
      'select kind, effective_at from public.request_rule_update($1, $2, $3::jsonb)',
      [scenario.ruleId, mode, windows],
    )

  const applyDue = async () =>
    (await scenario.query<{ count: number }>('select public.apply_due_rule_changes() as count'))
      .rows[0]?.count

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('schedules a removal after the cooldown and keeps the rule meanwhile', async () => {
    const { rows } = await requestRemoval()
    const hoursAhead = (rows[0]!.effective_at.getTime() - Date.now()) / 3_600_000
    expect(rows[0]!.kind).toBe('delete')
    expect(hoursAhead).toBeGreaterThan(23)
    expect(hoursAhead).toBeLessThanOrEqual(24)
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('does not apply changes before they are due', async () => {
    await requestRemoval()
    expect(await applyDue()).toBe(0)
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('removes the rule once the removal is due', async () => {
    await requestRemoval()
    await scenario.expirePendingRequests()
    expect(await applyDue()).toBe(1)
    expect(await scenario.readRules()).toEqual([])
  })

  it('applies a scheduled update once it is due', async () => {
    await requestUpdate()
    expect((await scenario.readRules())[0]?.mode).toBe('always')
    await scenario.expirePendingRequests()
    await applyDue()
    const [rule] = await scenario.readRules()
    expect(rule?.mode).toBe('schedule')
    expect(rule?.windows).toEqual(JSON.parse(SCHEDULE_WINDOWS))
  })

  it('keeps a single pending request per rule when the request changes', async () => {
    await requestRemoval()
    await requestUpdate()
    const { rows } = await scenario.query<RequestRow>('select kind from public.rule_change_requests')
    expect(rows).toEqual([{ kind: 'update' }])
  })

  it('keeps the original deadline when the same removal is requested again', async () => {
    const first = (await requestRemoval()).rows[0]!.effective_at
    const second = (await requestRemoval()).rows[0]!.effective_at
    expect(second.getTime()).toBe(first.getTime())
  })

  it('keeps the original deadline when the same update is requested again', async () => {
    const first = (await requestUpdate()).rows[0]!.effective_at
    const second = (await requestUpdate()).rows[0]!.effective_at
    expect(second.getTime()).toBe(first.getTime())
  })

  it('restarts the clock when the requested update changes', async () => {
    const first = (await requestUpdate()).rows[0]!.effective_at
    await scenario.query('select pg_sleep(0.05)')
    const other = JSON.stringify([{ days: [2], start: '08:00', end: '09:00' }])
    const second = (await requestUpdate('schedule', other)).rows[0]!.effective_at
    expect(second.getTime()).toBeGreaterThan(first.getTime())
  })

  it('applies changes immediately when the cooldown is zero', async () => {
    await scenario.actAsAdmin()
    await scenario.query('update public.profiles set cooldown_hours = 0 where id = $1', [
      scenario.alice,
    ])
    await scenario.actAs(scenario.alice)
    await requestRemoval()
    expect(await scenario.readRules()).toEqual([])
  })

  it('applies every due change for all users with the service function', async () => {
    await requestRemoval()
    await scenario.expirePendingRequests()
    await scenario.actAsAdmin()
    const { rows } = await scenario.query<{ count: number }>(
      'select public.apply_all_due_rule_changes() as count',
    )
    expect(rows[0]?.count).toBe(1)
    expect(await scenario.readRules()).toEqual([])
  })
})
