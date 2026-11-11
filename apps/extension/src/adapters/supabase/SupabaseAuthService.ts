import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthService, Unsubscribe } from '../../ports/AuthService'

function throwIfFailed(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(result.error.message)
}

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
    throwIfFailed(await this.client.auth.signInWithPassword({ email, password }))
  }

  async signUp(email: string, password: string): Promise<void> {
    throwIfFailed(await this.client.auth.signUp({ email, password }))
  }

  async signOut(): Promise<void> {
    throwIfFailed(await this.client.auth.signOut())
  }
}
