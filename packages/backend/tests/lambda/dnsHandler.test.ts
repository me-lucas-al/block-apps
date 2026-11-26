import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
import { describe, expect, it } from 'vitest'
import { createDnsLambdaHandler } from '../../src/lambda/createDnsLambdaHandler'
import {
  buildDnsApiGatewayEvent,
  EMPTY_LAMBDA_CONTEXT,
} from '../helpers/lambda/buildDnsApiGatewayEvent'
import { callApi } from '../helpers/callApi'
import { RESOLVER_TEST_TOKEN, seedDnsProfile } from '../helpers/dns/doh/seedDnsProfile'
import { buildDnsQuery, decodeDnsResponse } from '../helpers/dnsQueryHelpers'
import { backendFactories } from '../helpers/testBackends'
import { useTestBackend } from '../helpers/useTestBackend'

function decodeBase64Body(reply: APIGatewayProxyStructuredResultV2): Uint8Array {
  return new Uint8Array(Buffer.from(reply.body ?? '', 'base64'))
}

describe.each(backendFactories)('dns lambda handler with API Gateway v2 events ($name)', (factory) => {
  const backend = useTestBackend(factory)

  async function buildHandlerForBlockedSite() {
    await seedDnsProfile(backend())
    await callApi(backend().app, {
      method: 'POST',
      path: '/rules',
      body: { targetType: 'site', target: 'exemplo.com', mode: 'always', windows: [] },
    })
    const upstreamReply = buildDnsQuery('liberado.com', 'A', 77)
    const dnsApp = backend().createDnsResolver({ forwardQuery: async () => upstreamReply })
    return { handler: createDnsLambdaHandler(() => dnsApp), upstreamReply }
  }

  async function invoke(
    handler: Awaited<ReturnType<typeof buildHandlerForBlockedSite>>['handler'],
    method: 'GET' | 'POST',
    wireQuery: Uint8Array,
  ) {
    const event = buildDnsApiGatewayEvent({ method, token: RESOLVER_TEST_TOKEN, wireQuery })
    return (await handler(event, EMPTY_LAMBDA_CONTEXT)) as APIGatewayProxyStructuredResultV2
  }

  it('round-trips a base64 POST dns-message, blocked and forwarded', async () => {
    const { handler, upstreamReply } = await buildHandlerForBlockedSite()

    const blocked = await invoke(handler, 'POST', buildDnsQuery('exemplo.com', 'A', 5))
    expect(blocked.statusCode).toBe(200)
    expect(blocked.isBase64Encoded).toBe(true)
    expect(blocked.headers?.['content-type']).toBe('application/dns-message')
    expect(decodeDnsResponse(decodeBase64Body(blocked)).answers?.[0]).toMatchObject({ data: '0.0.0.0' })

    const forwarded = await invoke(handler, 'POST', buildDnsQuery('liberado.com', 'A', 77))
    expect(forwarded.statusCode).toBe(200)
    expect(decodeBase64Body(forwarded)).toEqual(upstreamReply)
  })

  it('answers a GET with the dns query string and rejects a POST with an empty body', async () => {
    const { handler } = await buildHandlerForBlockedSite()

    const blockedGet = await invoke(handler, 'GET', buildDnsQuery('www.exemplo.com', 'AAAA', 6))
    expect(blockedGet.statusCode).toBe(200)
    expect(decodeDnsResponse(decodeBase64Body(blockedGet)).answers?.[0]).toMatchObject({ data: '::' })

    const emptyPost = await invoke(handler, 'POST', new Uint8Array(0))
    expect(emptyPost.statusCode).toBe(400)
  })
})
