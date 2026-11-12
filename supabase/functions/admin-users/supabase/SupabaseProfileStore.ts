import type { SupabaseClient } from 'npm:@supabase/supabase-js@2'
import type { UpdateUserInput } from '../../_shared/admin-users/model/userInputs.ts'
import { PROFILES_PAGE_SIZE, PROFILE_COLUMNS, type ProfileRecord } from './profileRecords.ts'
import { throwSupabaseFailure } from './throwSupabaseFailure.ts'
import { toProfileColumns } from './toProfileColumns.ts'

export class SupabaseProfileStore {
  constructor(private readonly serviceRoleClient: SupabaseClient) {}

  async findProfile(userId: string): Promise<ProfileRecord | undefined> {
    const { data: profileRecord, error } = await this.serviceRoleClient
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle()
    if (error) throwSupabaseFailure('read profile', error)
    return (profileRecord as ProfileRecord | null) ?? undefined
  }

  async listAllProfiles(): Promise<ProfileRecord[]> {
    const allProfiles: ProfileRecord[] = []
    for (let firstRow = 0; ; firstRow += PROFILES_PAGE_SIZE) {
      const { data: profilesPage, error } = await this.serviceRoleClient
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .order('id')
        .range(firstRow, firstRow + PROFILES_PAGE_SIZE - 1)
      if (error) throwSupabaseFailure('list profiles', error)
      allProfiles.push(...(profilesPage as ProfileRecord[]))
      if (profilesPage.length < PROFILES_PAGE_SIZE) return allProfiles
    }
  }

  async countAdmins(): Promise<number> {
    const { count, error } = await this.serviceRoleClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
    if (error) throwSupabaseFailure('count admins', error)
    return count ?? 0
  }

  async writeProfile(userId: string, changes: UpdateUserInput): Promise<void> {
    const profileColumns = toProfileColumns(changes)
    if (Object.keys(profileColumns).length === 0) return
    const { error } = await this.serviceRoleClient.from('profiles').update(profileColumns).eq('id', userId)
    if (error) throwSupabaseFailure('update profile', error)
  }
}
