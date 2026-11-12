import type { SessionStorage, SessionTokens } from '@block-apps/api'

const STORAGE_KEY = 'block_apps_admin_tokens'

export class WebSessionStorage implements SessionStorage {
  constructor(private readonly storage: Storage = window.localStorage) {}

  async load(): Promise<SessionTokens | null> {
    try {
      const raw = this.storage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SessionTokens
    } catch {
      return null
    }
  }

  async save(tokens: SessionTokens): Promise<void> {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  }

  async clear(): Promise<void> {
    this.storage.removeItem(STORAGE_KEY)
  }
}
