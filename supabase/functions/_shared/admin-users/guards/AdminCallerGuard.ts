import { AdminError } from '../AdminError.ts'
import type { AdminUser } from '../model/adminUser.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'

export class AdminCallerGuard {
  constructor(private readonly userDirectory: UserDirectory) {}

  async requireAdminCaller(callerId: string | null): Promise<AdminUser> {
    if (!callerId) throw new AdminError('unauthenticated', 'authentication required')
    const caller = await this.userDirectory.find(callerId)
    if (caller?.role !== 'admin') throw new AdminError('forbidden', 'admin role required')
    if (caller.mustChangePassword) {
      throw new AdminError('password_change_required', 'change the temporary password first')
    }
    return caller
  }
}
