import { describe, expect, it, vi } from 'vitest'
import { buildWellFormedDnsToken } from '../../helpers/dns/doh/buildWellFormedDnsToken'
import {
  assembleResolveDohQueryUseCase,
  blockSiteAlways,
} from '../../helpers/dns/doh/assembleResolveDohQueryUseCase'
import { RESOLVER_TEST_TOKEN } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery, decodeDnsResponse } from '../../helpers/dnsQueryHelpers'

describe('ResolveDohQueryUseCase', () => {
  it('returns not-found for a well-formed token that no user owns', async () => {
    const { resolveDohQueryUseCase } = await assembleResolveDohQueryUseCase()
    const unknownToken = buildWellFormedDnsToken(9)

    expect(await resolveDohQueryUseCase.resolveDohQuery(unknownToken, buildDnsQuery('exemplo.com'))).toEqual({
      status: 'not-found',
    })
  })

  it('blocks matching domains without calling upstream', async () => {
    const { resolveDohQueryUseCase, upstream, ruleDatabase } = await assembleResolveDohQueryUseCase()
    await blockSiteAlways(ruleDatabase, 'exemplo.com')

    const resolution = await resolveDohQueryUseCase.resolveDohQuery(
      RESOLVER_TEST_TOKEN,
      buildDnsQuery('sub.exemplo.com'),
    )

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
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const { resolveDohQueryUseCase } = await assembleResolveDohQueryUseCase({
      upstream: {
        forwardQuery: async () => {
          throw new Error('timeout')
        },
      },
    })

    const resolution = await resolveDohQueryUseCase.resolveDohQuery(
      RESOLVER_TEST_TOKEN,
      buildDnsQuery('outro.com'),
    )

    expect(resolution.status).toBe('ok')
    if (resolution.status === 'ok') {
      expect(decodeDnsResponse(resolution.wireResponse).rcode).toBe('SERVFAIL')
    }
    vi.restoreAllMocks()
  })
})
