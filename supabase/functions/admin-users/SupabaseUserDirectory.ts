import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import { AdminError } from '../_shared/admin-users/AdminError.ts'
import type {
  AdminUser,
  CreateUserInput,
  UpdateUserInput,
  UserDirectory,
} from '../_shared/admin-users/types.ts'
import { PROFILE_COLUMNS, type ProfileRecord, toAdminUser } from './toAdminUser.ts'

const USERS_PER_PAGE = 1000

function throwSupabaseFailure(action: string, error: { message: string }): never {
  throw new Error(`${action}: ${error.message}`)
}

function toProfileColumns(changes: UpdateUserInput) {
  const columns: Record<string, unknown> = {}
  if (changes.displayName !== undefined) columns.display_name = changes.displayName
  if (changes.role !== undefined) columns.role = changes.role
  if (changes.cooldownHours !== undefined) columns.cooldown_hours = changes.cooldownHours
  if (changes.mustChangePassword !== undefined) columns.must_change_password = changes.mustChangePassword
  return columns
}

export class SupabaseUserDirectory implements UserDirectory {
  constructor(private readonly serviceRoleClient: SupabaseClient) {}

  async find(userId: string): Promise<AdminUser | null> {
    const { data, error } = await this.serviceRoleClient.auth.admin.getUserById(userId)
    if (error || !data.user) return null
    return toAdminUser(data.user, await this.readProfile(userId))
  }

  async list(): Promise<AdminUser[]> {
    const { data, error } = await this.serviceRoleClient.auth.admin.listUsers({ perPage: USERS_PER_PAGE })
    if (error) throwSupabaseFailure('list users', error)
    const profiles = await this.serviceRoleClient.from('profiles').select(PROFILE_COLUMNS)
    if (profiles.error) throwSupabaseFailure('list profiles', profiles.error)
    const byId = new Map((profiles.data as ProfileRecord[]).map((profile) => [profile.id, profile]))
    return data.users.flatMap((user) => {
      const profile = byId.get(user.id)
      return profile ? [toAdminUser(user, profile)] : []
    })
  }

  async create(newUser: CreateUserInput): Promise<AdminUser> {
    const { data, error } = await this.serviceRoleClient.auth.admin.createUser({
      email: newUser.email,
      password: newUser.password,
      email_confirm: true,
    })
    if (error) {
      if (error.code === 'email_exists') throw new AdminError('conflict', 'email already registered')
      throwSupabaseFailure('create user', error)
    }
    try {
      await this.writeProfile(data.user.id, newUser)
    } catch (failure) {
      await this.serviceRoleClient.auth.admin.deleteUser(data.user.id)
      throw failure
    }
    return toAdminUser(data.user, await this.readProfile(data.user.id))
  }

  async update(userId: string, changes: UpdateUserInput): Promise<AdminUser> {
    if (changes.email !== undefined || changes.password !== undefined) {
      const { error } = await this.serviceRoleClient.auth.admin.updateUserById(userId, {
        email: changes.email,
        password: changes.password,
        email_confirm: changes.email === undefined ? undefined : true,
      })
      if (error?.code === 'email_exists') throw new AdminError('conflict', 'email already registered')
      if (error) throwSupabaseFailure('update user', error)
    }
    await this.writeProfile(userId, changes)
    const updated = await this.find(userId)
    if (!updated) throw new AdminError('not_found', 'user not found')
    return updated
  }

  async remove(userId: string): Promise<void> {
    const { error } = await this.serviceRoleClient.auth.admin.deleteUser(userId)
    if (error) throwSupabaseFailure('delete user', error)
  }

  private async readProfile(userId: string): Promise<ProfileRecord> {
    const { data, error } = await this.serviceRoleClient
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .single()
    if (error) throwSupabaseFailure('read profile', error)
    return data as ProfileRecord
  }

  private async writeProfile(userId: string, changes: UpdateUserInput): Promise<void> {
    const columns = toProfileColumns(changes)
    if (Object.keys(columns).length === 0) return
    const { error } = await this.serviceRoleClient.from('profiles').update(columns).eq('id', userId)
    if (error) throwSupabaseFailure('update profile', error)
  }
}
