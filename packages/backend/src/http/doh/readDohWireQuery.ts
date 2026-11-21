import type { Context } from 'hono'
import { readBoundedBytes } from '../../domain/streams/readBoundedBytes'
import { DOH_MAX_ENCODED_QUERY_LENGTH, DOH_MAX_WIRE_BYTES } from './dohWireLimits'

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/
const DNS_MESSAGE_MEDIA_TYPE = 'application/dns-message'

export type ReadWireQueryResult =
  | { readonly status: 'ok'; readonly wireQuery: Uint8Array }
  | { readonly status: 'bad-request' }
  | { readonly status: 'payload-too-large' }
  | { readonly status: 'unsupported-media-type' }

const BAD_REQUEST: ReadWireQueryResult = { status: 'bad-request' }
const PAYLOAD_TOO_LARGE: ReadWireQueryResult = { status: 'payload-too-large' }

export function readGetDohWireQuery(context: Context): ReadWireQueryResult {
  const encodedQuery = context.req.query('dns')
  if (!encodedQuery) return BAD_REQUEST
  if (encodedQuery.length > DOH_MAX_ENCODED_QUERY_LENGTH) return PAYLOAD_TOO_LARGE
  if (!BASE64URL_PATTERN.test(encodedQuery)) return BAD_REQUEST
  const wireQuery = new Uint8Array(Buffer.from(encodedQuery, 'base64url'))
  if (wireQuery.byteLength === 0) return BAD_REQUEST
  if (wireQuery.byteLength > DOH_MAX_WIRE_BYTES) return PAYLOAD_TOO_LARGE
  return { status: 'ok', wireQuery }
}

function readDeclaredLength(context: Context): number | null | undefined {
  const declaredLength = context.req.header('content-length')
  if (declaredLength === undefined) return undefined
  const parsedLength = Number(declaredLength)
  return Number.isInteger(parsedLength) && parsedLength >= 0 ? parsedLength : null
}

export async function readPostDohWireQuery(context: Context): Promise<ReadWireQueryResult> {
  const mediaType = context.req.header('content-type')?.split(';')[0]?.trim().toLowerCase()
  if (mediaType !== DNS_MESSAGE_MEDIA_TYPE) return { status: 'unsupported-media-type' }
  const declaredLength = readDeclaredLength(context)
  if (declaredLength === null) return BAD_REQUEST
  if (declaredLength !== undefined && declaredLength > DOH_MAX_WIRE_BYTES) return PAYLOAD_TOO_LARGE
  const wireQuery = await readBoundedBytes(context.req.raw.body, DOH_MAX_WIRE_BYTES)
  if (!wireQuery) return PAYLOAD_TOO_LARGE
  if (wireQuery.byteLength === 0) return BAD_REQUEST
  return { status: 'ok', wireQuery }
}
