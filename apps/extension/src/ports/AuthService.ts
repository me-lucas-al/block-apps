export type Unsubscribe = () => void

export interface AuthService {
  currentUserEmail(): Promise<string | null>
  onChange(listener: (email: string | null) => void): Unsubscribe
  signIn(email: string, password: string): Promise<void>
  signUp(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
