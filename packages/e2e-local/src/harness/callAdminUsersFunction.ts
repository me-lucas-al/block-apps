import type { SignedInAccount } from './createSignedInAccounts.ts'
import type { LocalStackSettings } from './readLocalStackSettings.ts'

export type AdminUsersFunctionReply = {
  readonly status: number
  readonly body: Record<string, any>
}

export async function callAdminUsersFunction(
  settings: LocalStackSettings,
  caller: SignedInAccount,
  requestBody: object,
): Promise<AdminUsersFunctionReply> {
  const { data } = await caller.client.auth.getSession()
  const response = await fetch(`${settings.apiUrl}/functions/v1/admin-users`, {
    method: 'POST',
    headers: {
      apikey: settings.anonKey,
      Authorization: `Bearer ${data.session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  return { status: response.status, body: (await response.json()) as Record<string, any> }
}
