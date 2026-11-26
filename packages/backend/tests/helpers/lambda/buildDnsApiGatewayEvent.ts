import type { LambdaEvent } from '@hono/aws-lambda'
import type { Context } from 'aws-lambda'

export const EMPTY_LAMBDA_CONTEXT = {} as Context

type DnsEventOptions = {
  readonly method: 'GET' | 'POST'
  readonly token: string
  readonly wireQuery: Uint8Array
}

export function buildDnsApiGatewayEvent(options: DnsEventOptions): LambdaEvent {
  const isPost = options.method === 'POST'
  const encodedQuery = Buffer.from(options.wireQuery).toString('base64url')
  const event = {
    version: '2.0',
    routeKey: `${options.method} /dns-query/{token}`,
    rawPath: `/dns-query/${options.token}`,
    rawQueryString: isPost ? '' : `dns=${encodedQuery}`,
    headers: {
      host: 'dns.example.test',
      ...(isPost && { 'content-type': 'application/dns-message' }),
    },
    pathParameters: { token: options.token },
    requestContext: {
      domainName: 'dns.example.test',
      http: { method: options.method, path: `/dns-query/${options.token}` },
    },
    body: isPost ? Buffer.from(options.wireQuery).toString('base64') : null,
    isBase64Encoded: isPost,
  }
  return event as unknown as LambdaEvent
}
