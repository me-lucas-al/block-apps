import dnsPacket from 'dns-packet'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { assembleResolveDohQueryUseCase } from '../../helpers/dns/doh/assembleResolveDohQueryUseCase'
import {
  outageSiteRuleReader,
  outageTokenLookup,
  untouchableSiteRuleReader,
  untouchableTokenLookup,
} from '../../helpers/dns/doh/failingResolverStores'
import { RESOLVER_TEST_TOKEN } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery, decodeDnsResponse } from '../../helpers/dnsQueryHelpers'

const untouchedStores = {
  tokenLookup: untouchableTokenLookup,
  siteRuleReader: untouchableSiteRuleReader,
}

describe('ResolveDohQueryUseCase failures', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('answers not-found for a malformed token without touching any store', async () => {
    const { resolveDohQueryUseCase } = await assembleResolveDohQueryUseCase(untouchedStores)
    const malformedTokens = ['', 'short', `${RESOLVER_TEST_TOKEN}x`, `${RESOLVER_TEST_TOKEN.slice(1)}!`]

    for (const malformedToken of malformedTokens) {
      const resolution = await resolveDohQueryUseCase.resolveDohQuery(malformedToken, buildDnsQuery('a.com'))
      expect(resolution).toEqual({ status: 'not-found' })
    }
  })

  it('rejects an undecodable or multi-question message before any token lookup', async () => {
    const { resolveDohQueryUseCase } = await assembleResolveDohQueryUseCase(untouchedStores)
    const twoQuestions = new Uint8Array(
      dnsPacket.encode({
        type: 'query',
        id: 5,
        questions: [
          { type: 'A', class: 'IN', name: 'a.com' },
          { type: 'A', class: 'IN', name: 'b.com' },
        ],
      }),
    )

    for (const invalidQuery of [new Uint8Array(30).fill(9), twoQuestions]) {
      const resolution = await resolveDohQueryUseCase.resolveDohQuery(RESOLVER_TEST_TOKEN, invalidQuery)
      expect(resolution).toEqual({ status: 'invalid-query' })
    }
  })

  it('answers a valid SERVFAIL carrying the query id when the token lookup fails', async () => {
    const { resolveDohQueryUseCase, upstream } = await assembleResolveDohQueryUseCase({
      tokenLookup: outageTokenLookup,
    })

    const resolution = await resolveDohQueryUseCase.resolveDohQuery(
      RESOLVER_TEST_TOKEN,
      buildDnsQuery('a.com', 'A', 321),
    )

    expect(resolution.status).toBe('ok')
    if (resolution.status !== 'ok') return
    expect(decodeDnsResponse(resolution.wireResponse)).toMatchObject({ id: 321, rcode: 'SERVFAIL' })
    expect(upstream.forwardQuery).not.toHaveBeenCalled()
  })

  it('fails open to the upstream when rules cannot be read and nothing is cached', async () => {
    const { resolveDohQueryUseCase, upstream } = await assembleResolveDohQueryUseCase({
      siteRuleReader: outageSiteRuleReader,
    })
    const query = buildDnsQuery('exemplo.com', 'A', 8)

    const resolution = await resolveDohQueryUseCase.resolveDohQuery(RESOLVER_TEST_TOKEN, query)

    expect(resolution).toEqual({ status: 'ok', wireResponse: query })
    expect(upstream.forwardQuery).toHaveBeenCalledTimes(1)
  })
})
