import { beforeEach, describe, expect, it } from 'vitest'
import { type RuleScenario, createRuleScenario } from '../../harness/createRuleScenario'

const SCHEDULE_WINDOWS = JSON.stringify([{ days: [1], start: '18:00', end: '20:00' }])
const OTHER_WINDOWS = JSON.stringify([{ days: [2], start: '08:00', end: '09:00' }])

type RequestRow = { kind: string; effective_at: Date }

describe('rule change request deadline', () => {
  let scenario: RuleScenario

  const requestRemoval = () =>
    scenario.queryDatabase<RequestRow>(
      'select kind, effective_at from public.request_rule_removal($1)',
      [scenario.ruleId],
    )

  const requestUpdate = (windows: string) =>
    scenario.queryDatabase<RequestRow>(
      'select kind, effective_at from public.request_rule_update($1, $2, $3::jsonb)',
      [scenario.ruleId, 'schedule', windows],
    )

  const deadlineOf = (reply: { rows: RequestRow[] }) => reply.rows[0]!.effective_at.getTime()

  beforeEach(async () => {
    scenario = await createRuleScenario()
  })

  it('schedules a removal after the cooldown and keeps the rule meanwhile', async () => {
    const reply = await requestRemoval()
    const hoursAhead = (deadlineOf(reply) - Date.now()) / 3_600_000
    expect(reply.rows[0]!.kind).toBe('delete')
    expect(hoursAhead).toBeGreaterThan(23)
    expect(hoursAhead).toBeLessThanOrEqual(24)
    expect(await scenario.readRules()).toHaveLength(1)
  })

  it('keeps a single pending request per rule when the request changes', async () => {
    await requestRemoval()
    await requestUpdate(SCHEDULE_WINDOWS)
    const { rows } = await scenario.queryDatabase<RequestRow>(
      'select kind from public.rule_change_requests',
    )
    expect(rows).toEqual([{ kind: 'update' }])
  })

  it('keeps the original deadline when the same removal is requested again', async () => {
    const firstDeadline = deadlineOf(await requestRemoval())
    expect(deadlineOf(await requestRemoval())).toBe(firstDeadline)
  })

  it('keeps the original deadline when the same update is requested again', async () => {
    const firstDeadline = deadlineOf(await requestUpdate(SCHEDULE_WINDOWS))
    expect(deadlineOf(await requestUpdate(SCHEDULE_WINDOWS))).toBe(firstDeadline)
  })

  it('restarts the clock when the requested update changes', async () => {
    const firstDeadline = deadlineOf(await requestUpdate(SCHEDULE_WINDOWS))
    await scenario.queryDatabase('select pg_sleep(0.05)')
    expect(deadlineOf(await requestUpdate(OTHER_WINDOWS))).toBeGreaterThan(firstDeadline)
  })

  it('applies changes immediately when the cooldown is zero', async () => {
    await scenario.actAsAdmin()
    await scenario.queryDatabase('update public.profiles set cooldown_hours = 0 where id = $1', [
      scenario.alice,
    ])
    await scenario.actAs(scenario.alice)
    await requestRemoval()
    expect(await scenario.readRules()).toEqual([])
  })
})
