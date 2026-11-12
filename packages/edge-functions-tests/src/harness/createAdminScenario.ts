import { AdminCallerGuard } from '../../../../supabase/functions/_shared/admin-users/guards/AdminCallerGuard.ts'
import { ExistingUserGuard } from '../../../../supabase/functions/_shared/admin-users/guards/ExistingUserGuard.ts'
import { composeAdminUsersUseCases } from '../../../../supabase/functions/_shared/admin-users/composeAdminUsersUseCases.ts'
import type { AdminUser } from '../../../../supabase/functions/_shared/admin-users/model/adminUser.ts'
import { InMemoryUserDirectory } from './InMemoryUserDirectory.ts'

export function createAdminScenario() {
  const userDirectory = new InMemoryUserDirectory()
  const admin: AdminUser = userDirectory.seed({ email: 'admin@example.com', role: 'admin' })
  const commonUser: AdminUser = userDirectory.seed({ email: 'user@example.com', role: 'user' })

  return {
    userDirectory,
    admin,
    commonUser,
    adminCallerGuard: new AdminCallerGuard(userDirectory),
    existingUserGuard: new ExistingUserGuard(userDirectory),
    useCases: composeAdminUsersUseCases(userDirectory),
  }
}
