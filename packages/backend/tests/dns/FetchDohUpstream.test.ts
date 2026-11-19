import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_DOH_UPSTREAM_URL,
  FetchDohUpstream,
  readDohUpstreamUrl,
} from '../../src/dns/upstream/FetchDohUpstream'

describe('FetchDohUpstream', () => {
  it('posts DNS wire bytes with application/dns-message headers and returns raw bytes', async () => {
    const expected = new Uint8Array([1, 2, 3, 4])
    const fetchSpy = vi.fn(async () => new Response(expected, { status: 200 }))
    const upstream = new FetchDohUpstream('https://resolver.test/dns-query', 1500, fetchSpy)

    const query = new Uint8Array([9, 8, 7])
    const reply = await upstream.forwardQuery(query)

    expect(reply).toEqual(expected)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://resolver.test/dns-query',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/dns-message',
          accept: 'application/dns-message',
        },
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('throws when the upstream responds with an error status', async () => {
    const fetchSpy = vi.fn(async () => new Response('bad gateway', { status: 502 }))
    const upstream = new FetchDohUpstream('https://resolver.test/dns-query', 1500, fetchSpy)

    await expect(upstream.forwardQuery(new Uint8Array([1]))).rejects.toThrow('upstream returned status 502')
  })

  it('defaults DNS_UPSTREAM_URL to Cloudflare 1.1.1.1', () => {
    expect(readDohUpstreamUrl({})).toBe(DEFAULT_DOH_UPSTREAM_URL)
    expect(readDohUpstreamUrl({ DNS_UPSTREAM_URL: 'https://dns.google/dns-query' })).toBe(
      'https://dns.google/dns-query',
    )
  })
})
