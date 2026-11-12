import type { SessionStorage } from '../contracts/SessionStorage'
import type { SessionTokens } from '../contracts/SessionTokens'
import type { UserSession } from '../UserSession'
import type { Unsubscribe } from '../../subscription/Unsubscribe'

type EmailListener = (email: string | null) => void

export class LocalUserSession implements UserSession {
  private readonly listeners = new Set<EmailListener>()
  private lastKnownEmail: string | null = null

  constructor(private readonly storage: SessionStorage) {}

  async currentUserEmail(): Promise<string | null> {
    const tokens = await this.storage.load()
    this.lastKnownEmail = tokens?.email ?? null
    return this.lastKnownEmail
  }

  async currentIdToken(): Promise<string | null> {
    const tokens = await this.storage.load()
    return tokens?.idToken ?? null
  }

  async currentAccessToken(): Promise<string | null> {
    const tokens = await this.storage.load()
    return tokens?.accessToken ?? null
  }

  async notifySessionUpdated(tokens: SessionTokens | null): Promise<void> {
    const nextEmail = tokens?.email ?? null
    if (this.lastKnownEmail === nextEmail) return
    this.lastKnownEmail = nextEmail
    for (const listener of this.listeners) {
      listener(nextEmail)
    }
  }

  watchUserEmail(onUserEmailChanged: EmailListener): Unsubscribe {
    this.listeners.add(onUserEmailChanged)
    void this.currentUserEmail()
      .then((email) => {
        if (this.listeners.has(onUserEmailChanged)) {
          onUserEmailChanged(email)
        }
      })
      .catch(() => {})
    return () => {
      this.listeners.delete(onUserEmailChanged)
    }
  }
}
