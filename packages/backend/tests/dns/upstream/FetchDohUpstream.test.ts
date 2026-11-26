import { afterEach, describe, expect, it, vi } from 'vitest'
import { FetchDohUpstream } from '../../../src/dns/upstream/FetchDohUpstream'
import {
  startFakeUpstreamServer,
  type FakeUpstreamServer,
} from '../../helpers/dns/doh/startFakeUpstreamServer'
import { buildDnsQuery } from '../../helpers/dnsQueryHelpers'

const wireQuery = buildDnsQuery('exemplo.com', 'A', 0x2a2a)
const matchingResponse = buildDnsQuery('exemplo.com', 'A', 0x2a2a)
let runningServer: FakeUpstreamServer | undefined

async function startServerReplying(statusCode: number, body: Uint8Array, headers = {}) {
  runningServer = await startFakeUpstreamServer((_request, reply) => {
    reply.writeHead(statusCode, headers)
    reply.end(Buffer.from(body))
  })
  return runningServer.url
}

describe('FetchDohUpstream', () => {
  afterEach(async () => {
    await runningServer?.stop()
    runningServer = undefined
  })

  it('posts the wire bytes with dns-message headers, refusing redirects', async () => {
    const fetchSpy = vi.fn(async () => new Response(matchingResponse, { status: 200 }))
    const upstream = new FetchDohUpstream('https://resolver.test/dns-query', 1500, fetchSpy)

    expect(await upstream.forwardQuery(wireQuery)).toEqual(matchingResponse)

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://resolver.test/dns-query',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/dns-message', accept: 'application/dns-message' },
        redirect: 'error',
        signal: expect.any(AbortSignal),
      }),
    )
  })

  it('throws when the upstream responds with an error status', async () => {
    const fetchSpy = vi.fn(async () => new Response('bad gateway', { status: 502 }))
    const upstream = new FetchDohUpstream('https://resolver.test/dns-query', 1500, fetchSpy)

    await expect(upstream.forwardQuery(wireQuery)).rejects.toThrow('upstream returned status 502')
  })

  it('rejects a response shorter than a DNS header or with another message id', async () => {
    const shortUrl = await startServerReplying(200, new Uint8Array([0x2a, 0x2a, 1]))
    await expect(new FetchDohUpstream(shortUrl).forwardQuery(wireQuery)).rejects.toThrow('shorter')
    await runningServer?.stop()

    const otherIdUrl = await startServerReplying(200, buildDnsQuery('exemplo.com', 'A', 7))
    await expect(new FetchDohUpstream(otherIdUrl).forwardQuery(wireQuery)).rejects.toThrow('id')
  })

  it('rejects a response above the size limit', async () => {
    const hugeUrl = await startServerReplying(200, new Uint8Array(200).fill(2))
    const upstream = new FetchDohUpstream(hugeUrl, 1500, fetch, 100)

    await expect(upstream.forwardQuery(wireQuery)).rejects.toThrow('size limit')
  })

  it('fails instead of following a redirect', async () => {
    const redirectingUrl = await startServerReplying(302, new Uint8Array(0), {
      location: 'http://127.0.0.1:9/elsewhere',
    })

    await expect(new FetchDohUpstream(redirectingUrl).forwardQuery(wireQuery)).rejects.toThrow()
  })

  it('aborts when the upstream does not answer within the timeout', async () => {
    runningServer = await startFakeUpstreamServer(() => undefined)
    const upstream = new FetchDohUpstream(runningServer.url, 50)

    await expect(upstream.forwardQuery(wireQuery)).rejects.toThrow()
  })
})
