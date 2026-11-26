import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { applyDueChanges, listRules, postRule, WORKDAY_WINDOW } from '../helpers/ruleFixtures'
import {
  ALWAYS_BLOCKED_UPDATE,
  listPendingChanges,
  LONGER_WORKDAY_WINDOW,
  postScheduledRule,
  requestScheduleUpdate,
  SHORTER_WORKDAY_WINDOW,
} from '../helpers/scheduledRuleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('tightening with a pending change ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('keeps a pending loosening untouched when a tightening is applied', async () => {
    await postScheduledRule(backend())
    await requestScheduleUpdate(backend(), LONGER_WORKDAY_WINDOW)
    backend().clock.advanceHours(10)
    const reply = await requestScheduleUpdate(backend(), SHORTER_WORKDAY_WINDOW)
    expect(reply.json).toMatchObject({ status: 'applied' })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ windows: [SHORTER_WORKDAY_WINDOW] }),
    ])
    expect((await listPendingChanges(backend())).json).toEqual([
      expect.objectContaining({ kind: 'update', effectiveAt: '2026-11-12T12:00:00.000Z' }),
    ])
  })

  it('lets the earlier pending loosening take effect when its cooldown ends', async () => {
    await postScheduledRule(backend())
    await requestScheduleUpdate(backend(), LONGER_WORKDAY_WINDOW)
    await requestScheduleUpdate(backend(), SHORTER_WORKDAY_WINDOW)
    backend().clock.advanceHours(24)
    expect((await applyDueChanges(backend())).json).toEqual({ appliedCount: 1 })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ windows: [LONGER_WORKDAY_WINDOW] }),
    ])
  })

  it('keeps a pending selection removal untouched when a tightening is applied', async () => {
    const selectionBody = {
      targetType: 'iosSelection',
      target: 'social',
      mode: 'schedule',
      windows: [WORKDAY_WINDOW],
    }
    const rulePath = '/rules/iosSelection~social'
    await postRule(backend(), selectionBody)
    await callApi(backend().app, { method: 'POST', path: `${rulePath}/selection-removal-requests` })
    const reply = await callApi(backend().app, {
      method: 'POST',
      path: `${rulePath}/update-requests`,
      body: ALWAYS_BLOCKED_UPDATE,
    })
    expect(reply.json).toMatchObject({ status: 'applied' })
    expect((await listPendingChanges(backend())).json).toEqual([
      expect.objectContaining({ kind: 'selectionRemoval' }),
    ])
  })
})
