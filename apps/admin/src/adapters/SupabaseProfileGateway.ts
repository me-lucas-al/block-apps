import type { SupabaseClient } from '@supabase/supabase-js'
import type { MyProfile, ProfileGateway } from '../ports/ProfileGateway'
import type { UserRole } from '../ports/userTypes'

type ProfileRow = {
  display_name: string | null
  role: UserRole
  must_change_password: boolean
}

function assertNoError(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(result.error.message)
}

export class SupabaseProfileGateway implements ProfileGateway {
  constructor(private readonly client: SupabaseClient) {}

  async load(): Promise<MyProfile | null> {
    const { data: session } = await this.client.auth.getUser()
    const user = session.user
    if (!user) return null

    const { data, error } = await this.client
      .from('profiles')
      .select('display_name, role, must_change_password')
      .eq('id', user.id)
      .single()
    if (error) throw new Error(error.message)

    const profile = data as ProfileRow
    return {
      id: user.id,
      email: user.email ?? '',
      displayName: profile.display_name,
      role: profile.role,
      mustChangePassword: profile.must_change_password,
    }
  }

  async updateDisplayName(displayName: string | null): Promise<void> {
    const { data } = await this.client.auth.getUser()
    if (!data.user) throw new Error('Not authenticated')
    assertNoError(
      await this.client.from('profiles').update({ display_name: displayName }).eq('id', data.user.id),
    )
  }

  async changeEmail(email: string): Promise<void> {
    assertNoError(await this.client.auth.updateUser({ email }))
  }

  async changePassword(password: string): Promise<void> {
    assertNoError(await this.client.auth.updateUser({ password }))
  }

  async acknowledgePasswordChange(): Promise<void> {
    assertNoError(await this.client.rpc('acknowledge_password_change'))
  }
}
