import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { assertPublicApiKey } from './assertPublicApiKey'

export function createSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
  assertPublicApiKey(anonKey)

  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, flowType: 'pkce' },
  })
}
