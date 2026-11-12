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
    const target = await this.adminGuard.requireExistingUser(userId)

    const isChangingRole = changes.role !== undefined && changes.role !== target.role
    if (isChangingRole && userId === caller.id) {
      throw new AdminError('self_action', 'admins cannot change their own role')
    }
    if (isChangingRole && target.role === 'admin') await this.requireAnotherAdmin()
    if (isChangingRole && changes.role === 'admin' && changes.password === undefined) {
      throw new AdminError('invalid_input', 'a new password is required when promoting a user to admin')
    }

    return this.userDirectory.update(userId, this.forcePasswordChangeAfterReset(changes))
  }

  private forcePasswordChangeAfterReset(changes: UpdateUserInput): UpdateUserInput {
    const isResettingPassword = changes.password !== undefined
    return isResettingPassword && changes.mustChangePassword === undefined
      ? { ...changes, mustChangePassword: true }
      : changes
  }

  private async requireAnotherAdmin(): Promise<void> {
    if ((await this.userDirectory.countAdmins()) <= 1) {
      throw new AdminError('last_admin', 'at least one admin must remain')
    }
  }
}
