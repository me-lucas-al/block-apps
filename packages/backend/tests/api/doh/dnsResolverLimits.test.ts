import dnsPacket from 'dns-packet'
import { describe, expect, it } from 'vitest'
import { assembleDohResolverApp } from '../../../src/composition/doh/assembleDohResolverApp'
import { DOH_MAX_WIRE_BYTES } from '../../../src/http/doh/dohWireLimits'
import { UnreachableDnsSettingsStore } from '../../helpers/dns/UnreachableDnsSettingsStore'
import {
  DNS_MESSAGE_MEDIA_TYPE,
  getDohQuery,
  postDohQuery,
} from '../../helpers/dns/doh/dohRequests'
import {
  untouchableSiteRuleReader,
  untouchableTokenLookup,
} from '../../helpers/dns/doh/failingResolverStores'
import { RESOLVER_TEST_TOKEN } from '../../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery } from '../../helpers/dnsQueryHelpers'

const dnsApp = assembleDohResolverApp(
  new UnreachableDnsSettingsStore(),
  untouchableTokenLookup,
  untouchableSiteRuleReader,
  { forwardQuery: async (wireQuery) => wireQuery },
  () => new Date(),
)
const oversizedWire = new Uint8Array(DOH_MAX_WIRE_BYTES + 1).fill(1)

function postStreamedBody(wireQuery: Uint8Array) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(wireQuery)
      controller.close()
    },
  })
  return dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}`, {
    method: 'POST',
    headers: { 'content-type': DNS_MESSAGE_MEDIA_TYPE },
    body: stream,
    duplex: 'half',
  } as RequestInit)
}

describe('dns doh request limits and validation before any store access', () => {
  it('answers 413 for a GET whose dns parameter is too long', async () => {
    const reply = await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}?dns=${'A'.repeat(5_000)}`)
    expect(reply.status).toBe(413)
  })

  it('answers 413 for a POST above the wire limit, declared or streamed', async () => {
    expect((await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, oversizedWire)).status).toBe(413)
    expect((await postStreamedBody(oversizedWire)).status).toBe(413)
  })

  it('answers 400 for a GET without dns, a GET with an empty dns and a POST with an empty body', async () => {
    expect((await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}`)).status).toBe(400)
    expect((await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}?dns=`)).status).toBe(400)
    expect((await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, new Uint8Array(0))).status).toBe(400)
  })

  it('answers 400 for a malformed content-length and for a truncated message', async () => {
    const badLength = await dnsApp.request(`/dns-query/${RESOLVER_TEST_TOKEN}`, {
      method: 'POST',
      headers: { 'content-type': DNS_MESSAGE_MEDIA_TYPE, 'content-length': 'abc' },
      body: new Uint8Array([1, 2, 3]),
    })
    expect(badLength.status).toBe(400)
    expect((await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, new Uint8Array([1, 2, 3]))).status).toBe(400)
  })

  it('answers 400 for a message with several questions', async () => {
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
    expect((await getDohQuery(dnsApp, RESOLVER_TEST_TOKEN, twoQuestions)).status).toBe(400)
    expect((await postDohQuery(dnsApp, RESOLVER_TEST_TOKEN, twoQuestions)).status).toBe(400)
  })

  it('answers an empty 404 for a malformed token without touching any store', async () => {
    const query = buildDnsQuery('exemplo.com')
    const malformedTokens = ['unknown-token', RESOLVER_TEST_TOKEN.slice(1), `${RESOLVER_TEST_TOKEN}a`]

    for (const malformedToken of malformedTokens) {
      const getReply = await getDohQuery(dnsApp, malformedToken, query)
      const postReply = await postDohQuery(dnsApp, malformedToken, query)
      expect([getReply.status, postReply.status]).toEqual([404, 404])
      expect(await getReply.text()).toBe('')
    }
  })
})
