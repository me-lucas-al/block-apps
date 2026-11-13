import type { SessionTokens } from '@block-apps/api'

export type TokenField = keyof SessionTokens

export const LEGACY_STORAGE_KEY = 'block_apps_tokens'

export const TOKEN_KEYS: Readonly<Record<TokenField, string>> = {
  accessToken: 'block_apps_access_token',
  idToken: 'block_apps_id_token',
  refreshToken: 'block_apps_refresh_token',
  email: 'block_apps_session_email',
}

export const TOKEN_FIELDS = Object.keys(TOKEN_KEYS) as ReadonlyArray<TokenField>
