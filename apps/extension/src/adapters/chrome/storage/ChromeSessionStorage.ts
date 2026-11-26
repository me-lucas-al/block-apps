import type { SessionStorage, SessionTokens } from '@block-apps/api'

export const SESSION_STORAGE_KEY = 'block_apps_tokens'

export class ChromeSessionStorage implements SessionStorage {
  async load(): Promise<SessionTokens | null> {
    const data = await chrome.storage.local.get(SESSION_STORAGE_KEY)
    const tokens = data[SESSION_STORAGE_KEY] as SessionTokens | undefined
    return tokens ?? null
  }

  async save(tokens: SessionTokens): Promise<void> {
    await chrome.storage.local.set({ [SESSION_STORAGE_KEY]: tokens })
  }

  async clear(): Promise<void> {
    await chrome.storage.local.remove(SESSION_STORAGE_KEY)
  }
}
