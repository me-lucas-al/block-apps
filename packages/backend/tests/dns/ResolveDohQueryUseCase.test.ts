import { describe, expect, it, vi } from 'vitest'
import type { DohUpstream } from '../../src/dns/contracts/DohUpstream'
import { UserDnsStateCache } from '../../src/dns/resolver/UserDnsStateCache'
import { ResolveDohQueryUseCase } from '../../src/dns/use-cases/ResolveDohQueryUseCase'
import { buildDnsQuery, decodeDnsResponse } from '../helpers/dnsQueryHelpers'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

async function buildSut(upstream?: DohUpstream) {
  const database = new InMemoryRuleDatabase()
  await database.createDnsSettings('user-1', {
    token: 'tok-1',
    timeZone: 'America/Sao_Paulo',
    createdAt: '2026-11-19T12:00:00.000Z',
  })
  await database.insert('user-1', {
    id: 'site~exemplo.com',
    targetType: 'site',
    target: 'exemplo.com',
    mode: 'always',
    windows: [],
  })
  const resolvedUpstream: DohUpstream = upstream ?? {
    forwardQuery: vi.fn(async (query) => query),
  }
  const cache = new UserDnsStateCache(database, {
    listSiteRulesByUser: (userId) => database.listRulesByUser(userId),
  })
  const useCase = new ResolveDohQueryUseCase(
    cache,
    resolvedUpstream,
    () => new Date('2026-11-19T15:00:00Z'),
  )
  return { upstream: resolvedUpstream, useCase }
}

describe('ResolveDohQueryUseCase', () => {
  it('returns not-found for an unknown token', async () => {
    const { useCase } = await buildSut()
    expect(await useCase.resolve('missing-token', buildDnsQuery('exemplo.com'))).toEqual({
      status: 'not-found',
    })
  })

  it('blocks matching domains without calling upstream', async () => {
    const { useCase, upstream } = await buildSut()
    const result = await useCase.resolve('tok-1', buildDnsQuery('sub.exemplo.com'))

    expect(result.status).toBe('ok')
    expect(upstream.forwardQuery).not.toHaveBeenCalled()
    if (result.status === 'ok') {
      expect(decodeDnsResponse(result.wireResponse).answers?.[0]).toMatchObject({
        data: '0.0.0.0',
        ttl: 30,
      })
    }
  })

  it('returns SERVFAIL when upstream throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { useCase } = await buildSut({
      forwardQuery: async () => {
        throw new Error('timeout')
      },
    })

    const result = await useCase.resolve('tok-1', buildDnsQuery('outro.com'))
    expect(result.status).toBe('ok')
    if (result.status === 'ok') {
      expect(decodeDnsResponse(result.wireResponse).rcode).toBe('SERVFAIL')
    }
    consoleSpy.mockRestore()
  })
})
