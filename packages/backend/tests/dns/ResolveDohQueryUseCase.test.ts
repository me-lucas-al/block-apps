import { describe, expect, it, vi } from 'vitest'
import type { DohUpstream } from '../../src/dns/contracts/DohUpstream'
import { UserDnsStateCache } from '../../src/dns/resolver/UserDnsStateCache'
import { ResolveDohQueryUseCase } from '../../src/dns/use-cases/ResolveDohQueryUseCase'
import { buildDnsSettings } from '../helpers/dns/buildDnsSettings'
import { buildDnsQuery, decodeDnsResponse } from '../helpers/dnsQueryHelpers'
import { InMemoryDnsSettingsStore } from '../helpers/InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../helpers/InMemoryRuleDatabase'

async function buildUseCaseWithBlockedSite(upstream?: DohUpstream) {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  await dnsStore.createDnsSettings('user-1', buildDnsSettings('tok-1', 'America/Sao_Paulo'))
  await ruleDatabase.insert('user-1', {
    id: 'site~exemplo.com',
    targetType: 'site',
    target: 'exemplo.com',
    mode: 'always',
    windows: [],
  })
  const resolvedUpstream: DohUpstream = upstream ?? {
    forwardQuery: vi.fn(async (query) => query),
  }
  const cache = new UserDnsStateCache(dnsStore, dnsStore, ruleDatabase)
  const useCase = new ResolveDohQueryUseCase(
    cache,
    resolvedUpstream,
    () => new Date('2026-11-19T15:00:00Z'),
  )
  return { upstream: resolvedUpstream, useCase }
}

describe('ResolveDohQueryUseCase', () => {
  it('returns not-found for an unknown token', async () => {
    const { useCase } = await buildUseCaseWithBlockedSite()
    expect(await useCase.resolve('missing-token', buildDnsQuery('exemplo.com'))).toEqual({
      status: 'not-found',
    })
  })

  it('blocks matching domains without calling upstream', async () => {
    const { useCase, upstream } = await buildUseCaseWithBlockedSite()
    const resolution = await useCase.resolve('tok-1', buildDnsQuery('sub.exemplo.com'))

    expect(resolution.status).toBe('ok')
    expect(upstream.forwardQuery).not.toHaveBeenCalled()
    if (resolution.status === 'ok') {
      expect(decodeDnsResponse(resolution.wireResponse).answers?.[0]).toMatchObject({
        data: '0.0.0.0',
        ttl: 30,
      })
    }
  })

  it('returns SERVFAIL when upstream throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { useCase } = await buildUseCaseWithBlockedSite({
      forwardQuery: async () => {
        throw new Error('timeout')
      },
    })

    const resolution = await useCase.resolve('tok-1', buildDnsQuery('outro.com'))
    expect(resolution.status).toBe('ok')
    if (resolution.status === 'ok') {
      expect(decodeDnsResponse(resolution.wireResponse).rcode).toBe('SERVFAIL')
    }
    consoleSpy.mockRestore()
  })
})
