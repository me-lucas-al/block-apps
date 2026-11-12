import { type SupabaseClient, createClient } from '@supabase/supabase-js'
import { chromeStorageAuthAdapter } from '../chrome/chromeStorageAuthAdapter'

export function createSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }

  return createClient(url, anonKey, {
    auth: {
      storage: chromeStorageAuthAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })
}
