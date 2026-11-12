import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { AdminError } from '../../_shared/admin-users/AdminError.ts'
import type {
  AdminUser,
  CreateUserInput,
  UpdateUserInput,
  UserDirectory,
} from '../../_shared/admin-users/types.ts'
import { SupabaseProfileStore } from './SupabaseProfileStore.ts'
import { listAllAuthUsers } from './listAllAuthUsers.ts'
import { throwSupabaseFailure } from './throwSupabaseFailure.ts'
import { toAdminUser } from './toAdminUser.ts'

export class SupabaseUserDirectory implements UserDirectory {
  private readonly profileStore: SupabaseProfileStore

  constructor(private readonly serviceRoleClient: SupabaseClient) {
    this.profileStore = new SupabaseProfileStore(serviceRoleClient)
  }

  async find(userId: string): Promise<AdminUser | null> {
    const { data: authLookup, error } = await this.serviceRoleClient.auth.admin.getUserById(userId)
    if (error?.code === 'user_not_found') return null
    if (error) throwSupabaseFailure('find user', error)
    if (!authLookup.user) return null
    return toAdminUser(authLookup.user, await this.profileStore.findProfile(userId))
  }

  async list(): Promise<AdminUser[]> {
    const [authUsers, profiles] = await Promise.all([
      listAllAuthUsers(this.serviceRoleClient),
      this.profileStore.listAllProfiles(),
    ])
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]))
    return authUsers.map((authUser) => toAdminUser(authUser, profileById.get(authUser.id)))
  }

  countAdmins(): Promise<number> {
    return this.profileStore.countAdmins()
  }

  async create(newUser: CreateUserInput): Promise<AdminUser> {
    const { data: createdAuthUser, error } = await this.serviceRoleClient.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      email_confirm: true,
    })
    if (error) throwSupabaseFailure('create user', error)

    const createdUserId = createdAuthUser.user.id
    try {
      await this.profileStore.writeProfile(createdUserId, newUser)
      return toAdminUser(createdAuthUser.user, await this.profileStore.findProfile(createdUserId))
    } catch (failure) {
      await this.deleteAuthUserAfterFailedCreation(createdUserId)
      throw failure
    }
  }

  async update(userId: string, changes: UpdateUserInput): Promise<AdminUser> {
    if (changes.email !== undefined || changes.password !== undefined) {
      const { error } = await this.serviceRoleClient.auth.admin.updateUserById(userId, {
        email: changes.email,
        password: changes.password,
        email_confirm: changes.email === undefined ? undefined : true,
      })
      if (error) throwSupabaseFailure('update user', error)
    }
    await this.profileStore.writeProfile(userId, changes)

    const updatedUser = await this.find(userId)
    if (!updatedUser) throw new AdminError('not_found', 'user not found')
    return updatedUser
  }

  async remove(userId: string): Promise<void> {
    const { error } = await this.serviceRoleClient.auth.admin.deleteUser(userId)
    if (error) throwSupabaseFailure('delete user', error)
  }

  private async deleteAuthUserAfterFailedCreation(userId: string): Promise<void> {
    const { error } = await this.serviceRoleClient.auth.admin.deleteUser(userId)
    if (error) console.error(`could not roll back the auth user ${userId}: ${error.message}`)
  }
}
