import type { Hono } from 'hono'

export const DNS_MESSAGE_MEDIA_TYPE = 'application/dns-message'

export function getDohQuery(dnsApp: Hono, token: string, wireQuery: Uint8Array) {
  const encodedQuery = Buffer.from(wireQuery).toString('base64url')
  return dnsApp.request(`/dns-query/${token}?dns=${encodedQuery}`)
}

export function postDohQuery(dnsApp: Hono, token: string, wireQuery: Uint8Array) {
  return dnsApp.request(`/dns-query/${token}`, {
    method: 'POST',
    headers: { 'content-type': DNS_MESSAGE_MEDIA_TYPE },
    body: new Uint8Array(wireQuery),
  })
}

export async function readWireResponse(reply: Response): Promise<Uint8Array> {
  return new Uint8Array(await reply.arrayBuffer())
}
