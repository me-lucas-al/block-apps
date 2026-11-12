import { ConflictError } from '../../domain/errors/ConflictError'
import type { CooldownSettingsWriter } from '../contracts/CooldownSettingsWriter'
import type { UserReader } from '../contracts/UserReader'
import type { UserWriter } from '../contracts/UserWriter'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard'
import type { LastAdminGuard } from '../guards/LastAdminGuard'
import type { AdminUser, UserRole } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'
import type { UpdateUserInput } from '../model/userInputs'
import type { AdminUserPresenter } from '../presentation/AdminUserPresenter'

export class UpdateUserUseCase {
  constructor(
    private readonly userReader: UserReader,
    private readonly userWriter: UserWriter,
    private readonly cooldownSettingsWriter: CooldownSettingsWriter,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly existingUserGuard: ExistingUserGuard,
    private readonly lastAdminGuard: LastAdminGuard,
    private readonly adminUserPresenter: AdminUserPresenter,
  ) {}

  async updateUser(callerId: string, userId: string, changes: UpdateUserInput): Promise<AdminUser> {
    const caller = await this.adminCallerGuard.requireAdminCaller(callerId)
    const target = await this.existingUserGuard.requireExistingUser(userId)
    const newRole = changes.role !== undefined && changes.role !== target.role ? changes.role : null
    await this.requireAllowedRoleChange(caller, target, newRole)
    await this.applyChanges(target, newRole, changes)
    const updated = await this.userReader.find(userId)
    return this.adminUserPresenter.presentUser(updated ?? target)
  }

  private async requireAllowedRoleChange(
    caller: DirectoryUser,
    target: DirectoryUser,
    newRole: UserRole | null,
  ): Promise<void> {
    if (!newRole) return
    if (target.id === caller.id) throw new ConflictError('admins cannot change their own role')
    if (target.role === 'admin' && target.enabled) await this.lastAdminGuard.requireAnotherAdmin()
  }

  private async applyChanges(
    target: DirectoryUser,
    newRole: UserRole | null,
    changes: UpdateUserInput,
  ): Promise<void> {
    if (changes.displayName !== undefined) {
      await this.userWriter.updateDisplayName(target.id, changes.displayName)
    }
    if (changes.cooldownHours !== undefined) {
      await this.cooldownSettingsWriter.writeCooldownHours(target.id, changes.cooldownHours)
    }
    if (newRole) await this.userWriter.changeRole(target.id, target.role, newRole)
    if (newRole === 'admin' || changes.resetPassword) {
      await this.userWriter.forcePasswordReset(target.id)
    }
  }
}
