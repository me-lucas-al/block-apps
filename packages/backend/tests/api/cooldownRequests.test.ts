import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import {
  applyDueChanges,
  listRules,
  postRule,
  requestRemoval,
  requestUpdate,
  SITE_RULE_ID,
} from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('cooldown requests ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('does not restart the cooldown when the same update is requested again', async () => {
    await postRule(backend())
    const first = await requestUpdate(backend())
    backend().clock.advanceHours(10)
    const second = await requestUpdate(backend())
    expect(second.json).toEqual(first.json)
  })

  it('restarts the cooldown when a different change is requested', async () => {
    await postRule(backend())
    await requestUpdate(backend())
    backend().clock.advanceHours(10)
    const removal = await requestRemoval(backend())
    expect(removal.json).toMatchObject({ kind: 'delete', effectiveAt: '2026-11-12T22:00:00.000Z' })
  })

  it('cancels a pending change', async () => {
    await postRule(backend())
    await requestUpdate(backend())
    const cancel = await callApi(backend().app, {
      method: 'DELETE',
      path: `/pending-changes/${SITE_RULE_ID}`,
    })
    expect(cancel.status).toBe(204)
    backend().clock.advanceHours(48)
    await applyDueChanges(backend())
    expect((await listRules(backend())).json).toEqual([expect.objectContaining({ mode: 'always' })])
  })

  it('does not let a user change the rule of another user', async () => {
    await postRule(backend(), undefined, 'user-1')
    expect((await requestUpdate(backend(), undefined, 'user-2')).status).toBe(404)
    expect((await requestRemoval(backend(), 'user-2')).status).toBe(404)
  })

  it('rejects an invalid update body', async () => {
    await postRule(backend())
    const reply = await requestUpdate(backend(), { mode: 'schedule', windows: [] })
    expect(reply.status).toBe(400)
  })
})
