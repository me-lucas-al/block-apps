import { describe, expect, it, vi } from 'vitest'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpBlockRuleRepository } from '../../src/repositories/http/rules/HttpBlockRuleRepository'

describe('HttpBlockRuleRepository', () => {
  it('lists rules from GET /rules', async () => {
    const rules: BlockRule[] = [
      { id: '1', targetType: 'site', target: 'site.com', mode: 'always', windows: [] },
    ]
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(rules), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpBlockRuleRepository(client)

    const result = await repo.list()
    expect(result).toEqual(rules)
    expect(fetchMock).toHaveBeenCalledWith('https://api.test/rules', expect.objectContaining({ method: 'GET' }))
  })

  it('creates rule through POST /rules and notifies poller', async () => {
    const created: BlockRule = { id: 'r2', targetType: 'site', target: 'x.com', mode: 'always', windows: [] }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(created), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([created]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpBlockRuleRepository(client)

    const changed = vi.fn()
    repo.subscribeToRuleChanges(changed)

    const result = await repo.create({ targetType: 'site', target: 'x.com', mode: 'always', windows: [] })
    expect(result).toEqual(created)
  })

  it('returns the applied rule when POST /rules/:ruleId/update-requests tightens the block', async () => {
    const rule: BlockRule = { id: 'r1', targetType: 'site', target: 'x.com', mode: 'always', windows: [] }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'applied', rule }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([rule]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpBlockRuleRepository(client)

    const outcome = await repo.requestUpdate('r1', { mode: 'always', windows: [] })
    expect(outcome).toEqual({ status: 'applied', rule })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/rules/r1/update-requests',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('returns the pending change when POST /rules/:ruleId/update-requests loosens the block', async () => {
    const change: PendingRuleChange = {
      id: 'r1',
      ruleId: 'r1',
      kind: 'update',
      mode: 'schedule',
      windows: [{ days: [1], start: '09:00', end: '17:00' }],
      effectiveAt: '2026-11-12T12:00:00.000Z',
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'pending', change }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpBlockRuleRepository(client)

    const outcome = await repo.requestUpdate('r1', { mode: 'schedule', windows: change.windows ?? [] })
    expect(outcome).toEqual({ status: 'pending', change })
  })

  it('requests a selection removal on its own endpoint', async () => {
    const change = { id: 'r1', ruleId: 'r1', kind: 'selectionRemoval', mode: null, windows: null, effectiveAt: 'x' }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(change), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const result = await new HttpBlockRuleRepository(client).requestSelectionRemoval('r1')

    expect(result).toEqual(change)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.test/rules/r1/selection-removal-requests')
  })
})
