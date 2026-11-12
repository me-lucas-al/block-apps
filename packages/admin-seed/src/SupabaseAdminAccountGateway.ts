import type { AdminAccountGateway, NewAdminAccount } from './AdminAccountGateway.ts'

type FetchImplementation = typeof fetch

export class SupabaseAdminAccountGateway implements AdminAccountGateway {
  private readonly supabaseUrl: string
  private readonly serviceRoleKey: string
  private readonly sendRequest: FetchImplementation

  constructor(supabaseUrl: string, serviceRoleKey: string, sendRequest: FetchImplementation = fetch) {
    this.supabaseUrl = supabaseUrl
    this.serviceRoleKey = serviceRoleKey
    this.sendRequest = sendRequest
  }

  async createAuthUser(account: NewAdminAccount): Promise<string> {
    const response = await this.sendRequest(`${this.supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: this.serviceHeaders(),
      body: JSON.stringify({ email: account.email, password: account.password, email_confirm: true }),
    })
    const body = (await response.json()) as { id?: string; msg?: string; error_code?: string }
    if (!response.ok || !body.id) {
      const reason = body.error_code === 'email_exists' ? 'this email already has an account' : body.msg
      throw new Error(`could not create the auth user: ${reason ?? response.status}`)
    }
    return body.id
  }

  async promoteProfileToAdmin(userId: string, displayName: string): Promise<void> {
    const response = await this.sendRequest(`${this.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: { ...this.serviceHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ role: 'admin', display_name: displayName, must_change_password: true }),
    })
    const updatedProfiles = (await response.json()) as unknown[]
    if (!response.ok || updatedProfiles.length !== 1) {
      throw new Error(`could not promote the profile to admin (status ${response.status})`)
    }
  }

  async deleteAuthUser(userId: string): Promise<void> {
    const response = await this.sendRequest(`${this.supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.serviceHeaders(),
    })
    if (!response.ok) {
      throw new Error(`could not remove the half-created auth user ${userId} (status ${response.status})`)
    }
  }

  private serviceHeaders(): Record<string, string> {
    return {
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      'Content-Type': 'application/json',
    }
  }
}
