import { describe, expect, it, vi } from 'vitest'
import { callApi } from '../../helpers/callApi'
import { buildWellFormedDnsToken } from '../../helpers/dns/doh/buildWellFormedDnsToken'
import { getDohQuery, postDohQuery, readWireResponse } from '../../helpers/dns/doh/dohRequests'
import { RESOLVER_TEST_TOKEN, seedDnsProfile } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery, decodeDnsResponse } from '../../helpers/dnsQueryHelpers'
import { backendFactories } from '../../helpers/testBackends'
import { useTestBackend } from '../../helpers/useTestBackend'

const BLOCKED_SITE_RULE = { targetType: 'site', target: 'exemplo.com', mode: 'always', windows: [] }

describe.each(backendFactories)('dns doh resolver ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('blocks site rules and subdomains via GET and POST while forwarding allowed domains', async () => {
    await seedDnsProfile(backend(), 'America/Sao_Paulo')
    await callApi(backend().app, { method: 'POST', path: '/rules', body: BLOCKED_SITE_RULE })
    const upstreamReply = buildDnsQuery('outro.com', 'A', 13)
    const forwardQuery = vi.fn(async () => upstreamReply)
    const dnsApp = backend().createDnsResolver({ forwardQuery })

    const blockedGet = await getDohQuery(dnsApp, RESOLVER_TEST_TOKEN, buildDnsQuery('sub.exemplo.com', 'A', 11))
    expect(blockedGet.status).toBe(200)
    expect(blockedGet.headers.get('content-type')).toBe('application/dns-message')
    const decodedGet = decodeDnsResponse(await readWireResponse(blockedGet))
    expect(decodedGet.answers?.[0]).toMatchObject({ type: 'A', data: '0.0.0.0', ttl: 30 })

    const blockedPost = await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, buildDnsQuery('exemplo.com', 'AAAA', 12))
    expect(blockedPost.status).toBe(200)
    const decodedPost = decodeDnsResponse(await readWireResponse(blockedPost))
    expect(decodedPost.answers?.[0]).toMatchObject({ type: 'AAAA', data: '::', ttl: 30 })

    const allowedPost = await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, buildDnsQuery('outro.com', 'A', 13))
    expect(allowedPost.status).toBe(200)
    expect(await readWireResponse(allowedPost)).toEqual(upstreamReply)
    expect(forwardQuery).toHaveBeenCalledTimes(1)
  })

  it('returns an empty 404 for a well-formed token that no user owns', async () => {
    await seedDnsProfile(backend())
    const dnsApp = backend().createDnsResolver({ forwardQuery: async (query) => query })

    const unknown = await getDohQuery(dnsApp, buildWellFormedDnsToken(9), buildDnsQuery('exemplo.com'))
    expect(unknown.status).toBe(404)
    expect(await unknown.text()).toBe('')
  })

  it('returns 415 for a wrong media type and 400 for an undecodable query', async () => {
    await seedDnsProfile(backend())
    const dnsApp = backend().createDnsResolver({ forwardQuery: async (query) => query })

    const wrongMediaType = await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    expect(wrongMediaType.status).toBe(415)

    const invalidBase64 = await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}?dns=not!base64`)
    expect(invalidBase64.status).toBe(400)

    const garbageQuery = await getDohQuery(dnsApp, RESOLVER_TEST_TOKEN, new Uint8Array(20).fill(7))
    expect(garbageQuery.status).toBe(400)
  })
})
