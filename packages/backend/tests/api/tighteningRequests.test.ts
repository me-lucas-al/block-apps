import { describe, expect, it } from 'vitest'
import { listRules, requestUpdate, SITE_RULE_ID, WORKDAY_WINDOW } from '../helpers/ruleFixtures'
import {
  ALWAYS_BLOCKED_UPDATE,
  listPendingChanges,
  LONGER_WORKDAY_WINDOW,
  postScheduledRule,
  requestScheduleUpdate,
  SATURDAY_WINDOW,
  SHORTER_WORKDAY_WINDOW,
} from '../helpers/scheduledRuleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('rule changes that tighten the block ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('applies right away when a schedule becomes always blocked', async () => {
    await postScheduledRule(backend())
    const reply = await requestUpdate(backend(), ALWAYS_BLOCKED_UPDATE)
    expect(reply.status).toBe(200)
    expect(reply.json).toEqual({
      status: 'applied',
      rule: expect.objectContaining({ id: SITE_RULE_ID, mode: 'always', windows: [] }),
    })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ mode: 'always', windows: [] }),
    ])
    expect((await listPendingChanges(backend())).json).toEqual([])
  })

  it('applies right away when the allowed windows get smaller', async () => {
    await postScheduledRule(backend())
    const reply = await requestScheduleUpdate(backend(), SHORTER_WORKDAY_WINDOW)
    expect(reply.json).toMatchObject({ status: 'applied', rule: { mode: 'schedule' } })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ windows: [SHORTER_WORKDAY_WINDOW] }),
    ])
    expect((await listPendingChanges(backend())).json).toEqual([])
  })

  it('keeps waiting for the cooldown when the allowed windows get larger', async () => {
    await postScheduledRule(backend())
    const reply = await requestScheduleUpdate(backend(), LONGER_WORKDAY_WINDOW)
    expect(reply.json).toMatchObject({
      status: 'pending',
      change: { kind: 'update', effectiveAt: '2026-11-12T12:00:00.000Z' },
    })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ windows: [WORKDAY_WINDOW] }),
    ])
  })

  it('keeps waiting for the cooldown when the change tightens and loosens at once', async () => {
    await postScheduledRule(backend())
    const reply = await requestScheduleUpdate(backend(), SHORTER_WORKDAY_WINDOW, SATURDAY_WINDOW)
    expect(reply.json).toMatchObject({ status: 'pending' })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ windows: [WORKDAY_WINDOW] }),
    ])
  })

  it('answers 404 when the rule to tighten does not exist', async () => {
    const reply = await requestUpdate(backend(), ALWAYS_BLOCKED_UPDATE)
    expect(reply.status).toBe(404)
  })
})
