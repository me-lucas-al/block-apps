import { AdminError } from '../AdminError.ts'
import type { AdminGuard } from '../AdminGuard.ts'
import type { UserDirectory } from '../types.ts'

export class DeleteUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminGuard: AdminGuard,
  ) {}

  async deleteUser(callerId: string | null, userId: string): Promise<void> {
    const caller = await this.adminGuard.requireAdminCaller(callerId)
    if (userId === caller.id) {
      throw new AdminError('self_action', 'admins cannot delete their own account')
    }

    const target = await this.adminGuard.requireExistingUser(userId)
    const isLastAdmin = target.role === 'admin' && (await this.userDirectory.countAdmins()) <= 1
    if (isLastAdmin) throw new AdminError('last_admin', 'at least one admin must remain')

    await this.userDirectory.remove(userId)
  }
}
