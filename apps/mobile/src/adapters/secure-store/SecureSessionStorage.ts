import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store'
import type { SessionStorage, SessionTokens } from '@block-apps/api'

const STORAGE_KEY = 'block_apps_tokens'

export class SecureSessionStorage implements SessionStorage {
  async load(): Promise<SessionTokens | null> {
    const raw = await getItemAsync(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as SessionTokens
    } catch {
      return null
    }
  }

  async save(tokens: SessionTokens): Promise<void> {
    await setItemAsync(STORAGE_KEY, JSON.stringify(tokens))
  }

  async clear(): Promise<void> {
    await deleteItemAsync(STORAGE_KEY)
  }
}
