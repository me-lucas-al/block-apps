import { describe, expect, it, vi } from 'vitest'
import { callApi } from '../helpers/callApi'
import { buildDnsQuery, decodeDnsResponse } from '../helpers/dnsQueryHelpers'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

describe.each(backendFactories)('dns doh resolver ($name)', (factory) => {
  const backend = useTestBackend(factory)

  it('blocks site rules and subdomains via GET and POST while forwarding allowed domains', async () => {
    await callApi(backend().app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'America/Sao_Paulo' },
    })
    await callApi(backend().app, {
      method: 'POST',
      path: '/rules',
      body: { targetType: 'site', target: 'exemplo.com', mode: 'always', windows: [] },
    })

    const upstreamReply = new Uint8Array([0xaa, 0xbb, 0xcc])
    const forwardQuery = vi.fn(async () => upstreamReply)
    const dnsApp = backend().createDnsResolver({ forwardQuery })

    const encoded = Buffer.from(buildDnsQuery('sub.exemplo.com', 'A', 11)).toString('base64url')
    const blockedGet = await dnsApp.request(`/dns-query/test-token-1?dns=${encoded}`)
    expect(blockedGet.status).toBe(200)
    expect(blockedGet.headers.get('content-type')).toBe('application/dns-message')
    const decodedGet = decodeDnsResponse(new Uint8Array(await blockedGet.arrayBuffer()))
    expect(decodedGet.answers?.[0]).toMatchObject({ type: 'A', data: '0.0.0.0', ttl: 30 })

    const blockedPost = await dnsApp.request('/dns-query/test-token-1', {
      method: 'POST',
      headers: { 'content-type': 'application/dns-message' },
      body: new Uint8Array(buildDnsQuery('exemplo.com', 'AAAA', 12)),
    })
    expect(blockedPost.status).toBe(200)
    const decodedPost = decodeDnsResponse(new Uint8Array(await blockedPost.arrayBuffer()))
    expect(decodedPost.answers?.[0]).toMatchObject({ type: 'AAAA', data: '::', ttl: 30 })

    const allowedPost = await dnsApp.request('/dns-query/test-token-1', {
      method: 'POST',
      headers: { 'content-type': 'application/dns-message' },
      body: new Uint8Array(buildDnsQuery('outro.com', 'A', 13)),
    })
    expect(allowedPost.status).toBe(200)
    expect(new Uint8Array(await allowedPost.arrayBuffer())).toEqual(upstreamReply)
    expect(forwardQuery).toHaveBeenCalledTimes(1)
  })

  it('returns empty 404 for unknown tokens, 415 for wrong media type, and 400 for invalid dns query', async () => {
    await callApi(backend().app, {
      method: 'POST',
      path: '/dns/profile',
      body: { timeZone: 'UTC' },
    })
    const dnsApp = backend().createDnsResolver({ forwardQuery: async (query) => query })

    const unknown = await dnsApp.request('/dns-query/unknown-token')
    expect(unknown.status).toBe(404)
    expect(await unknown.text()).toBe('')

    const wrongType = await dnsApp.request('/dns-query/test-token-1', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    })
    expect(wrongType.status).toBe(415)

    const badGet = await dnsApp.request('/dns-query/test-token-1?dns=not!base64')
    expect(badGet.status).toBe(400)
  })
})
