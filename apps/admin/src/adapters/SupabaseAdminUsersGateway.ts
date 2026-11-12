import type { SupabaseClient } from '@supabase/supabase-js'
import type { AdminUsersGateway } from '../ports/AdminUsersGateway'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../ports/userTypes'
import { invokeAdminFunction } from './invokeAdminFunction'

export class SupabaseAdminUsersGateway implements AdminUsersGateway {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<AdminUser[]> {
    const { users } = await invokeAdminFunction<{ users: AdminUser[] }>(this.client, { action: 'list' })
    return users
  }

  async create(input: CreateUserInput): Promise<AdminUser> {
    const { user } = await invokeAdminFunction<{ user: AdminUser }>(this.client, {
      action: 'create',
      user: input,
    })
    return user
  }

  async update(userId: string, input: UpdateUserInput): Promise<AdminUser> {
    const { user } = await invokeAdminFunction<{ user: AdminUser }>(this.client, {
      action: 'update',
      id: userId,
      user: input,
    })
    return user
  }

  async remove(userId: string): Promise<void> {
    await invokeAdminFunction(this.client, { action: 'delete', id: userId })
  }
}
