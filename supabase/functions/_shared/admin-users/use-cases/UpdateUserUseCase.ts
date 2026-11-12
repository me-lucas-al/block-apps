import { AdminError } from '../AdminError.ts'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard.ts'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard.ts'
import type { AdminUser } from '../model/adminUser.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'
import type { UpdateUserInput } from '../model/userInputs.ts'

export class UpdateUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly existingUserGuard: ExistingUserGuard,
  ) {}

  async updateUser(
    callerId: string | null,
    userId: string,
    changes: UpdateUserInput,
  ): Promise<AdminUser> {
    const caller = await this.adminCallerGuard.requireAdminCaller(callerId)
    const target = await this.existingUserGuard.requireExistingUser(userId)

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
