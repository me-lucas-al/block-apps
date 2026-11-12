import { AdminError } from '../AdminError.ts'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard.ts'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'

export class DeleteUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly existingUserGuard: ExistingUserGuard,
  ) {}

  async deleteUser(callerId: string | null, userId: string): Promise<void> {
    const caller = await this.adminCallerGuard.requireAdminCaller(callerId)
    if (userId === caller.id) {
      throw new AdminError('self_action', 'admins cannot delete their own account')
    }

    const target = await this.existingUserGuard.requireExistingUser(userId)
    const isLastAdmin = target.role === 'admin' && (await this.userDirectory.countAdmins()) <= 1
    if (isLastAdmin) throw new AdminError('last_admin', 'at least one admin must remain')

    await this.userDirectory.remove(userId)
  }
}
