import { describe, expect, it } from 'vitest'
import { callApi } from '../helpers/callApi'
import {
  applyDueChanges,
  listRules,
  postRule,
  requestRemoval,
  requestUpdate,
  WORKDAY_WINDOW,
} from '../helpers/ruleFixtures'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('cooldown flow ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('keeps the rule unchanged until the cooldown ends, then applies the update', async () => {
    await postRule(backend())
    const request = await requestUpdate(backend())
    expect(request.json).toMatchObject({ kind: 'update', effectiveAt: '2026-11-12T12:00:00.000Z' })

    backend().clock.advanceHours(23)
    expect((await applyDueChanges(backend())).json).toEqual({ appliedCount: 0 })
    expect((await listRules(backend())).json).toEqual([expect.objectContaining({ mode: 'always' })])

    backend().clock.advanceHours(1)
    expect((await applyDueChanges(backend())).json).toEqual({ appliedCount: 1 })
    expect((await listRules(backend())).json).toEqual([
      expect.objectContaining({ mode: 'schedule', windows: [WORKDAY_WINDOW] }),
    ])
    const pending = await callApi(backend().app, { method: 'GET', path: '/pending-changes' })
    expect(pending.json).toEqual([])
  })

  it('removes the rule only after the cooldown ends', async () => {
    await postRule(backend())
    await requestRemoval(backend())
    expect((await listRules(backend())).json).toHaveLength(1)

    backend().clock.advanceHours(24)
    await applyDueChanges(backend())
    expect((await listRules(backend())).json).toEqual([])
  })

  it('applies the change right away when the cooldown is zero', async () => {
    await backend().setCooldownHours('user-1', 0)
    await postRule(backend())
    await requestUpdate(backend())
    expect((await listRules(backend())).json).toEqual([expect.objectContaining({ mode: 'schedule' })])
  })

  it('applies due changes of every user in one pass', async () => {
    await postRule(backend(), undefined, 'user-1')
    await postRule(backend(), undefined, 'user-2')
    await requestUpdate(backend(), undefined, 'user-1')
    await requestRemoval(backend(), 'user-2')
    backend().clock.advanceHours(24)
    expect(await backend().applyAllDueChanges()).toBe(2)
    expect((await listRules(backend(), 'user-2')).json).toEqual([])
  })
})
