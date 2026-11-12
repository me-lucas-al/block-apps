import type { SessionTokens } from './SessionTokens'

export interface SessionStorage {
  load(): Promise<SessionTokens | null>
  save(tokens: SessionTokens): Promise<void>
  clear(): Promise<void>
}
