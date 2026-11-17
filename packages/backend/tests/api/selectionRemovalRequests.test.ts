import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import { applyDueChanges, listRules, postRule } from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

const SELECTION_BODY = { targetType: 'iosSelection', target: 'social', mode: 'always' }
const SELECTION_RULE_ID = 'iosSelection~social'

function requestSelectionRemoval(backend: { app: Parameters<typeof callApi>[0] }, ruleId: string) {
  const path = `/rules/${ruleId}/selection-removal-requests`
  return callApi(backend.app, { method: 'POST', path, userId: 'user-1' })
}

describe.each(backendFactories)('selection removal requests ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('schedules a selection removal with the cooldown of the account', async () => {
    await postRule(backend(), SELECTION_BODY)
    const reply = await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    expect(reply.status).toBe(200)
    expect(reply.json).toMatchObject({
      kind: 'selectionRemoval',
      ruleId: SELECTION_RULE_ID,
      mode: null,
      windows: null,
      effectiveAt: '2026-11-12T12:00:00.000Z',
    })
  })

  it('does not restart the cooldown when the same removal is requested again', async () => {
    await postRule(backend(), SELECTION_BODY)
    const first = await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    backend().clock.advanceHours(5)
    const second = await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    expect(second.json).toEqual(first.json)
  })

  it('keeps the rule untouched when the removal comes due', async () => {
    await postRule(backend(), SELECTION_BODY)
    await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    backend().clock.advanceHours(25)
    await applyDueChanges(backend())
    const rules = await listRules(backend())
    expect(rules.json).toEqual([expect.objectContaining({ id: SELECTION_RULE_ID, mode: 'always' })])
    const pending = await callApi(backend().app, { method: 'GET', path: '/pending-changes', userId: 'user-1' })
    expect(pending.json).toEqual([])
  })

  it('rejects a selection removal for a rule that is not an app group', async () => {
    await postRule(backend())
    const reply = await requestSelectionRemoval(backend(), 'site~example.com')
    expect(reply.status).toBe(400)
  })

  it('answers not found for a rule that does not exist', async () => {
    const reply = await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    expect(reply.status).toBe(404)
  })

  it('replaces a pending schedule update, restarting the cooldown', async () => {
    await postRule(backend(), SELECTION_BODY)
    await callApi(backend().app, {
      method: 'POST',
      path: `/rules/${SELECTION_RULE_ID}/update-requests`,
      body: { mode: 'schedule', windows: [{ days: [1], start: '09:00', end: '17:00' }] },
      userId: 'user-1',
    })
    backend().clock.advanceHours(10)
    const reply = await requestSelectionRemoval(backend(), SELECTION_RULE_ID)
    expect(reply.json).toMatchObject({ kind: 'selectionRemoval', effectiveAt: '2026-11-12T22:00:00.000Z' })
  })
})
