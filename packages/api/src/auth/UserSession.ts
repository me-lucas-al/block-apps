import type { Unsubscribe } from '../subscription/Unsubscribe'

export interface UserSession {
  currentUserEmail(): Promise<string | null>
  watchUserEmail(onUserEmailChanged: (email: string | null) => void): Unsubscribe
}
