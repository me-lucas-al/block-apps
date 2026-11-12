import type { SupabaseClient } from '@supabase/supabase-js'
import type { MyProfile, ProfileGateway } from '../ports/ProfileGateway'
import type { UserRole } from '../ports/userTypes'

type ProfileRow = {
  display_name: string | null
  role: UserRole
  must_change_password: boolean
}

function throwIfSupabaseError(response: { error: { message: string } | null }): void {
  if (response.error) throw new Error(response.error.message)
}

export class SupabaseProfileGateway implements ProfileGateway {
  constructor(private readonly client: SupabaseClient) {}

  async loadMyProfile(): Promise<MyProfile | null> {
    const { data: authUserResponse } = await this.client.auth.getUser()
    const authUser = authUserResponse.user
    if (!authUser) return null

    const { data: profileRow, error } = await this.client
      .from('profiles')
      .select('display_name, role, must_change_password')
      .eq('id', authUser.id)
      .single()
    if (error) throw new Error(error.message)

    const profile = profileRow as ProfileRow
    return {
      id: authUser.id,
      email: authUser.email ?? '',
      displayName: profile.display_name,
      role: profile.role,
      mustChangePassword: profile.must_change_password,
    }
  }

  async updateMyDisplayName(displayName: string | null): Promise<void> {
    const { data: authUserResponse } = await this.client.auth.getUser()
    if (!authUserResponse.user) throw new Error('Not authenticated')
    throwIfSupabaseError(
      await this.client
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', authUserResponse.user.id),
    )
  }

  async changeEmail(email: string): Promise<void> {
    throwIfSupabaseError(await this.client.auth.updateUser({ email }))
  }

  async changePassword(password: string): Promise<void> {
    throwIfSupabaseError(await this.client.auth.updateUser({ password }))
  }
}
