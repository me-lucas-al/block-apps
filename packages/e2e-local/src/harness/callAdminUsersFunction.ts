import type { SignedInAccount } from './createSignedInAccounts.ts'
import type { LocalStackSettings } from './readLocalStackSettings.ts'

export type AdminUserSummary = {
  readonly id: string
  readonly email: string
  readonly displayName: string | null
  readonly role: 'user' | 'admin'
  readonly cooldownHours: number
  readonly mustChangePassword: boolean
}

export type AdminUsersReplyBody = {
  readonly user?: AdminUserSummary
  readonly users?: readonly AdminUserSummary[]
  readonly ok?: boolean
  readonly error?: { readonly code: string; readonly message: string }
}

export type AdminUsersFunctionReply = {
  readonly status: number
  readonly body: AdminUsersReplyBody
}

export function requireUserInReply(reply: AdminUsersFunctionReply): AdminUserSummary {
  if (!reply.body.user) throw new Error(`reply has no user (status ${reply.status})`)
  return reply.body.user
}

export function requireUsersInReply(reply: AdminUsersFunctionReply): readonly AdminUserSummary[] {
  if (!reply.body.users) throw new Error(`reply has no users (status ${reply.status})`)
  return reply.body.users
}

export async function callAdminUsersFunction(
  settings: LocalStackSettings,
  caller: SignedInAccount,
  requestBody: object,
): Promise<AdminUsersFunctionReply> {
  const { data: sessionResponse } = await caller.client.auth.getSession()
  const response = await fetch(`${settings.apiUrl}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      apikey: settings.anonKey,
      Authorization: `Bearer ${sessionResponse.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  return { status: response.status, body: (await response.json()) as AdminUsersReplyBody }
}
