import type { SessionTokens } from '@block-apps/api'
import { getItemAsync } from 'expo-secure-store'
import { TOKEN_FIELDS, TOKEN_KEYS, type TokenField } from './secureSessionKeys'

export type StoredFields = Readonly<Record<TokenField, string | null>>

export async function readStoredFields(): Promise<StoredFields> {
  const entries = await Promise.all(
    TOKEN_FIELDS.map(async (field) => [field, await getItemAsync(TOKEN_KEYS[field])] as const),
  )
  return Object.fromEntries(entries) as StoredFields
}

export function toCompleteSession(fields: StoredFields): SessionTokens | null {
  const { accessToken, idToken, refreshToken, email } = fields
  if (!accessToken || !idToken || !refreshToken || !email) return null
  return { accessToken, idToken, refreshToken, email }
}
