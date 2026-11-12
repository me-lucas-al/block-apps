import { AdminError } from '../AdminError.ts'
import type { AdminGuard } from '../AdminGuard.ts'
import type { AdminUser, UpdateUserInput, UserDirectory } from '../types.ts'

export class UpdateUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminGuard: AdminGuard,
  ) {}

  async updateUser(
    callerId: string | null,
    userId: string,
    changes: UpdateUserInput,
  ): Promise<AdminUser> {
    const caller = await this.adminGuard.requireAdminCaller(callerId)
    await this.adminGuard.requireExistingUser(userId)

    const isChangingOwnRole =
      userId === caller.id && changes.role !== undefined && changes.role !== caller.role
    if (isChangingOwnRole) {
      throw new AdminError('self_action', 'admins cannot change their own role')
    }
    return this.userDirectory.update(userId, changes)
  }
}
