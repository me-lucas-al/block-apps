import { createClient } from 'npm:@supabase/supabase-js@2'

function requireEnvironmentVariable(name: string): string {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`missing environment variable ${name}`)
  return value
}

export function createServiceRoleClient() {
  return createClient(
    requireEnvironmentVariable('SUPABASE_URL'),
    requireEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
