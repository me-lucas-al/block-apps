import { describe, expect, it, vi } from 'vitest'
import type { PendingRuleChange } from '@block-apps/core'
import { HttpApiClient } from '../../src/http/client/HttpApiClient'
import { HttpPendingRuleChangeRepository } from '../../src/repositories/http/pending-changes/HttpPendingRuleChangeRepository'

describe('HttpPendingRuleChangeRepository', () => {
  it('requests removal via POST /rules/:ruleId/removal-requests', async () => {
    const change: PendingRuleChange = {
      id: 'c1',
      ruleId: 'r1',
      kind: 'delete',
      mode: null,
      windows: null,
      effectiveAt: '2026-11-12T12:00:00Z',
    }
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(change), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpPendingRuleChangeRepository(client)

    const result = await repo.requestRemoval('r1')
    expect(result).toEqual(change)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/rules/r1/removal-requests',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('cancels pending change via DELETE /pending-changes/:ruleId', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpPendingRuleChangeRepository(client)

    await repo.cancelPendingChange('r1')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/pending-changes/r1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('applies due changes via POST /pending-changes/apply-due', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ appliedCount: 2 }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const client = new HttpApiClient({ baseUrl: 'https://api.test', getToken: async () => 'tok' })
    const repo = new HttpPendingRuleChangeRepository(client)

    await repo.applyDueChanges()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.test/pending-changes/apply-due',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
