import type { SupabaseClient } from '@supabase/supabase-js'
import { assertNoError } from '../repositories/supabase/unwrap'
import type { AuthService, Unsubscribe } from './AuthService'

export class SupabaseAuthService implements AuthService {
  constructor(private readonly client: SupabaseClient) {}

  async currentUserEmail(): Promise<string | null> {
    const { data } = await this.client.auth.getSession()
    return data.session?.user.email ?? null
  }

  onChange(listener: (email: string | null) => void): Unsubscribe {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session?.user.email ?? null)
    })
    return () => data.subscription.unsubscribe()
  }

  async signIn(email: string, password: string): Promise<void> {
    assertNoError(await this.client.auth.signInWithPassword({ email, password }))
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    assertNoError(
      await this.client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }),
    )
  }

  async signUp(email: string, password: string): Promise<void> {
    assertNoError(await this.client.auth.signUp({ email, password }))
  }

  async signOut(): Promise<void> {
    assertNoError(await this.client.auth.signOut())
  }
}
