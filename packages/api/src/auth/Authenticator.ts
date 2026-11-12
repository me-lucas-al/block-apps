export interface Authenticator {
  signInWithPassword(email: string, password: string): Promise<void>
  signInWithGoogle(redirectTo: string): Promise<void>
  signUpWithPassword(email: string, password: string): Promise<void>
  signOut(): Promise<void>
}
