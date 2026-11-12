import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'

export class MemorySessionStorage implements SessionStorage {
  private currentTokens: SessionTokens | null = null

  async load(): Promise<SessionTokens | null> {
    return this.currentTokens
  }

  async save(tokens: SessionTokens): Promise<void> {
    this.currentTokens = tokens
  }

  async clear(): Promise<void> {
    this.currentTokens = null
  }
}
