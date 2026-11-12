import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import type { AuthUserRecord } from './profileRecords.ts'
import { throwSupabaseFailure } from './throwSupabaseFailure.ts'

const AUTH_USERS_PAGE_SIZE = 1000

export async function listAllAuthUsers(serviceRoleClient: SupabaseClient): Promise<AuthUserRecord[]> {
  const allAuthUsers: AuthUserRecord[] = []
  for (let pageNumber = 1; ; pageNumber += 1) {
    const { data: authUsersPage, error } = await serviceRoleClient.auth.admin.listUsers({
      page: pageNumber,
      perPage: AUTH_USERS_PAGE_SIZE,
    })
    if (error) throwSupabaseFailure('list users', error)
    allAuthUsers.push(...authUsersPage.users)
    if (authUsersPage.users.length < AUTH_USERS_PAGE_SIZE) return allAuthUsers
  }
}
