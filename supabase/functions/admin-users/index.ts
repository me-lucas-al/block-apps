import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildAdminUsersResponse } from '../_shared/admin-users/buildAdminUsersResponse.ts'
import { composeAdminUsersUseCases } from '../_shared/admin-users/composeAdminUsersUseCases.ts'
import { SupabaseUserDirectory } from './SupabaseUserDirectory.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const serviceRoleClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
)
const adminUsersUseCases = composeAdminUsersUseCases(new SupabaseUserDirectory(serviceRoleClient))

async function readCallerIdFromAuthorizationHeader(request: Request): Promise<string | null> {
  const accessToken = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!accessToken) return null
  const { data } = await serviceRoleClient.auth.getUser(accessToken)
  return data.user?.id ?? null
}

async function readJsonBodyOrUndefined(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  const adminUsersResponse = await buildAdminUsersResponse(
    {
      method: request.method,
      callerId: await readCallerIdFromAuthorizationHeader(request),
      body: await readJsonBodyOrUndefined(request),
    },
    adminUsersUseCases,
  )
  return Response.json(adminUsersResponse.body, {
    status: adminUsersResponse.status,
    headers: CORS_HEADERS,
  })
})
