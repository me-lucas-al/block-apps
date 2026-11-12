import { AdminError } from './AdminError.ts'
import type { AdminUser, UserDirectory } from './types.ts'

export class AdminGuard {
  constructor(private readonly userDirectory: UserDirectory) {}

  async requireAdminCaller(callerId: string | null): Promise<AdminUser> {
    if (!callerId) throw new AdminError('unauthenticated', 'authentication required')
    const caller = await this.userDirectory.find(callerId)
    if (caller?.role !== 'admin') throw new AdminError('forbidden', 'admin role required')
    return caller
  }

  async requireExistingUser(userId: string): Promise<AdminUser> {
    const user = await this.userDirectory.find(userId)
    if (!user) throw new AdminError('not_found', 'user not found')
    return user
  }
}
