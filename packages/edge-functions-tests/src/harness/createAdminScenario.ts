import { AdminGuard } from '../../../../supabase/functions/_shared/admin-users/AdminGuard.ts'
import { composeAdminUsersUseCases } from '../../../../supabase/functions/_shared/admin-users/composeAdminUsersUseCases.ts'
import type { AdminUser } from '../../../../supabase/functions/_shared/admin-users/types.ts'
import { InMemoryUserDirectory } from './InMemoryUserDirectory.ts'

export function createAdminScenario() {
  const userDirectory = new InMemoryUserDirectory()
  const admin: AdminUser = userDirectory.seed({ email: 'admin@example.com', role: 'admin' })
  const commonUser: AdminUser = userDirectory.seed({ email: 'user@example.com', role: 'user' })

  return {
    userDirectory,
    admin,
    commonUser,
    adminGuard: new AdminGuard(userDirectory),
    useCases: composeAdminUsersUseCases(userDirectory),
  }
}
