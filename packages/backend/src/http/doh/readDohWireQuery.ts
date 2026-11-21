import type { Context } from 'hono'

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/

export type ReadWireQueryResult =
  | { readonly status: 'ok'; readonly wireQuery: Uint8Array }
  | { readonly status: 'bad-request' }
  | { readonly status: 'unsupported-media-type' }

export function readGetDohWireQuery(context: Context): ReadWireQueryResult {
  const encoded = context.req.query('dns')
  if (!encoded || !BASE64URL_PATTERN.test(encoded)) return { status: 'bad-request' }
  const decoded = Buffer.from(encoded, 'base64url')
  if (decoded.byteLength === 0) return { status: 'bad-request' }
  return { status: 'ok', wireQuery: new Uint8Array(decoded) }
}

export async function readPostDohWireQuery(context: Context): Promise<ReadWireQueryResult> {
  const contentType = context.req.header('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (contentType !== 'application/dns-message') return { status: 'unsupported-media-type' }
  const wireQuery = new Uint8Array(await context.req.arrayBuffer())
  if (wireQuery.byteLength === 0) return { status: 'bad-request' }
  return { status: 'ok', wireQuery }
}
