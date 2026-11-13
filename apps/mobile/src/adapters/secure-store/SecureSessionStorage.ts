import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'
import type { SessionStorage, SessionTokens } from '@block-apps/api'

const LEGACY_STORAGE_KEY = 'block_apps_tokens'

const TOKEN_KEYS: Readonly<Record<keyof SessionTokens, string>> = {
  accessToken: 'block_apps_access_token',
  idToken: 'block_apps_id_token',
  refreshToken: 'block_apps_refresh_token',
  email: 'block_apps_session_email',
}

const TOKEN_FIELDS = Object.keys(TOKEN_KEYS) as ReadonlyArray<keyof SessionTokens>

export class SecureSessionStorage implements SessionStorage {
  async load(): Promise<SessionTokens | null> {
    try {
      return (await this.loadFromTokenKeys()) ?? (await this.migrateLegacySession())
    } catch {
      return null
    }
  }

  async save(tokens: SessionTokens): Promise<void> {
    try {
      await Promise.all(TOKEN_FIELDS.map((field) => setItemAsync(TOKEN_KEYS[field], tokens[field])))
    } catch (failure) {
      await this.clear()
      throw failure
    }
  }

  async clear(): Promise<void> {
    const keys = [...TOKEN_FIELDS.map((field) => TOKEN_KEYS[field]), LEGACY_STORAGE_KEY]
    await Promise.all(keys.map((key) => deleteItemAsync(key)))
  }

  private async loadFromTokenKeys(): Promise<SessionTokens | null> {
    const storedFields = await Promise.all(
      TOKEN_FIELDS.map(async (field) => [field, await getItemAsync(TOKEN_KEYS[field])] as const),
    )
    if (storedFields.some(([, storedValue]) => !storedValue)) return null
    return Object.fromEntries(storedFields) as SessionTokens
  }

  private async migrateLegacySession(): Promise<SessionTokens | null> {
    const rawLegacySession = await getItemAsync(LEGACY_STORAGE_KEY)
    if (!rawLegacySession) return null
    const legacyTokens = JSON.parse(rawLegacySession) as SessionTokens
    await this.save(legacyTokens)
    await deleteItemAsync(LEGACY_STORAGE_KEY)
    return legacyTokens
  }
}
