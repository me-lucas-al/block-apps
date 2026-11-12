import type { SupabaseClient } from '@supabase/supabase-js'
import { throwIfSupabaseError } from '../supabase/throwIfSupabaseError'
import type { Authenticator } from './Authenticator'

export class SupabaseAuthenticator implements Authenticator {
  constructor(private readonly client: SupabaseClient) {}

  async signInWithPassword(email: string, password: string): Promise<void> {
    throwIfSupabaseError(await this.client.auth.signInWithPassword({ email, password }))
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    throwIfSupabaseError(
      await this.client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } }),
    )
  }

  async signUpWithPassword(email: string, password: string): Promise<void> {
    throwIfSupabaseError(await this.client.auth.signUp({ email, password }))
  }

  async signOut(): Promise<void> {
    throwIfSupabaseError(await this.client.auth.signOut())
  }
}
