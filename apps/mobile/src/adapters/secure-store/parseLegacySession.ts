import type { SessionTokens } from '@block-apps/api'
import { TOKEN_FIELDS, type TokenField } from './secureSessionKeys'
import { toCompleteSession, type StoredFields } from './storedFields'

function readTextField(source: object, field: TokenField): string | null {
  if (!(field in source)) return null
  const fieldValue = (source as Record<TokenField, unknown>)[field]
  return typeof fieldValue === 'string' ? fieldValue : null
}

export function parseLegacySession(rawLegacySession: string): SessionTokens | null {
  let parsedSession: unknown
  try {
    parsedSession = JSON.parse(rawLegacySession)
  } catch {
    return null
  }
  if (typeof parsedSession !== 'object' || parsedSession === null) return null
  const fields = Object.fromEntries(
    TOKEN_FIELDS.map((field) => [field, readTextField(parsedSession as object, field)]),
  ) as StoredFields
  return toCompleteSession(fields)
}
