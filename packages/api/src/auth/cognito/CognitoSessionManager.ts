import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'
import { SessionRevocationError } from '../SessionRevocationError'
import type { LocalUserSession } from '../session/LocalUserSession'
import type { CognitoAccountOps } from './CognitoAccountOps'
import type { CognitoTokenRevoker } from './CognitoTokenRevoker'
import { isRejectedRefreshToken } from './isRejectedRefreshToken'

export class CognitoSessionManager {
  constructor(
    private readonly storage: SessionStorage,
    private readonly session: LocalUserSession,
    private readonly accountOps: CognitoAccountOps,
    private readonly tokenRevoker: CognitoTokenRevoker,
  ) {}

  async persistTokens(tokens: SessionTokens): Promise<void> {
    await this.storage.save(tokens)
    await this.session.notifySessionUpdated(tokens)
  }

  async signOut(): Promise<void> {
    let tokens: SessionTokens | null = null
    try {
      tokens = await this.storage.load()
      await this.revokeRefreshToken(tokens)
    } finally {
      try {
        if (tokens?.email) this.accountOps.clearCachedSession(tokens.email)
      } finally {
        await this.forgetSession()
      }
    }
  }

  async refreshSession(): Promise<SessionTokens | null> {
    const tokens = await this.storage.load()
    if (!tokens?.refreshToken) return null
    try {
      const refreshed = await this.accountOps.refreshSession(tokens.email, tokens.refreshToken)
      await this.persistTokens(refreshed)
      return refreshed
    } catch (refreshError) {
      if (isRejectedRefreshToken(refreshError)) await this.forgetSession()
      return null
    }
  }

  private async revokeRefreshToken(tokens: SessionTokens | null): Promise<void> {
    if (!tokens?.refreshToken) return
    try {
      await this.tokenRevoker.revokeRefreshToken(tokens.refreshToken)
    } catch (revocationFailure) {
      throw new SessionRevocationError(revocationFailure)
    }
  }

  private async forgetSession(): Promise<void> {
    await this.storage.clear()
    await this.session.notifySessionUpdated(null)
  }
}
