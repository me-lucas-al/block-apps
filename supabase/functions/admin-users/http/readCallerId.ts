import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'

export async function readCallerId(
  request: Request,
  serviceRoleClient: SupabaseClient,
  logFailure: (message: string) => void,
): Promise<string | null> {
  const accessToken = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!accessToken) return null

  const { data: tokenOwner, error } = await serviceRoleClient.auth.getUser(accessToken)
  if (error) logFailure(`could not verify the access token: ${error.message}`)
  return tokenOwner.user?.id ?? null
}
