import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionGate } from '../../ports/data/SessionGate'

export class SupabaseSessionGate implements SessionGate {
  constructor(private readonly client: SupabaseClient) {}

  async hasSession(): Promise<boolean> {
    const { data } = await this.client.auth.getSession()
    return data.session !== null
  }
}
