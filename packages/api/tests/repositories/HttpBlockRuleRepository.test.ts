import { describe, expect, it, vi } from 'vitest'
import type { BlockRule } from '@block-apps/core'
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

  it('requests update via POST /rules/:ruleId/update-requests', async () => {
    const change = {
      id: 'c1',
      ruleId: 'r1',
      kind: 'update' as const,
      status: 'pending' as const,
      availableAt: '2026-11-12T12:00:00Z',
      payload: { mode: 'always' as const, windows: [] },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(change), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpBlockRuleRepository(client)

    const result = await repo.requestUpdate('r1', { mode: 'always', windows: [] })
    expect(result).toEqual(change)
  })
})
