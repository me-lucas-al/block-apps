import type { Unsubscribe } from '../subscription/Unsubscribe'

export interface UserSession {
  currentUserEmail(): Promise<string | null>
  currentIdToken(): Promise<string | null>
  currentAccessToken(): Promise<string | null>
  watchUserEmail(onUserEmailChanged: (email: string | null) => void): Unsubscribe
}
