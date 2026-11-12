import { buildAdminUsersResponse } from '../_shared/admin-users/buildAdminUsersResponse.ts'
import { composeAdminUsersUseCases } from '../_shared/admin-users/composeAdminUsersUseCases.ts'
import { buildCorsHeaders } from './http/buildCorsHeaders.ts'
import { readCallerId } from './http/readCallerId.ts'
import { readJsonBody } from './http/readJsonBody.ts'
import { SupabaseUserDirectory } from './supabase/SupabaseUserDirectory.ts'
import { createServiceRoleClient } from './supabase/createServiceRoleClient.ts'

const corsHeaders = buildCorsHeaders(Deno.env.get('ADMIN_ALLOWED_ORIGIN') ?? '*')
const serviceRoleClient = createServiceRoleClient()
const adminUsersUseCases = composeAdminUsersUseCases(new SupabaseUserDirectory(serviceRoleClient))

function logServerSide(message: string): void {
  console.error(`[admin-users] ${message}`)
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const adminUsersResponse = await buildAdminUsersResponse(
    {
      method: request.method,
      callerId: await readCallerId(request, serviceRoleClient, logServerSide),
      body: await readJsonBody(request),
    },
    adminUsersUseCases,
    (failure) => logServerSide(failure instanceof Error ? failure.message : String(failure)),
  )
  return Response.json(adminUsersResponse.body, {
    status: adminUsersResponse.status,
    headers: corsHeaders,
  })
})
