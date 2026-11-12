import type { SupabaseClient } from '@supabase/supabase-js'
import type { Unsubscribe } from '../subscription/Unsubscribe'
import type { UserSession } from './UserSession'

export class SupabaseUserSession implements UserSession {
  constructor(private readonly client: SupabaseClient) {}

  async currentUserEmail(): Promise<string | null> {
    const { data: sessionResponse } = await this.client.auth.getSession()
    return sessionResponse.session?.user.email ?? null
  }

  async currentIdToken(): Promise<string | null> {
    const { data } = await this.client.auth.getSession()
    return data.session?.access_token ?? null
  }

  async currentAccessToken(): Promise<string | null> {
    const { data } = await this.client.auth.getSession()
    return data.session?.access_token ?? null
  }

  watchUserEmail(onUserEmailChanged: (email: string | null) => void): Unsubscribe {
    const { data: authSubscription } = this.client.auth.onAuthStateChange((_event, session) => {
      onUserEmailChanged(session?.user.email ?? null)
    })
    return () => authSubscription.subscription.unsubscribe()
  }
}
