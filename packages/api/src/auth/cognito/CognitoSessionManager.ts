import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { LocalUserSession } from '../session/LocalUserSession'
import type { CognitoAccountOps } from './CognitoAccountOps'

export class CognitoSessionManager {
  constructor(
    private readonly storage: SessionStorage,
    private readonly session: LocalUserSession,
    private readonly accountOps: CognitoAccountOps,
  ) {}

  async persistTokens(tokens: SessionTokens): Promise<void> {
    await this.storage.save(tokens)
    await this.session.notifySessionUpdated(tokens)
  }

  async signOut(): Promise<void> {
    const tokens = await this.storage.load()
    if (tokens?.email) await this.accountOps.globalSignOut(tokens.email)
    await this.storage.clear()
    await this.session.notifySessionUpdated(null)
  }

  async refreshSession(): Promise<SessionTokens | null> {
    const tokens = await this.storage.load()
    if (!tokens?.refreshToken) return null
    try {
      const refreshed = await this.accountOps.refreshSession(tokens.email, tokens.refreshToken)
      await this.persistTokens(refreshed)
      return refreshed
    } catch {
      await this.storage.clear()
      await this.session.notifySessionUpdated(null)
      return null
    }
  }
}
