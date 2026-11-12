import { ConflictError } from '../../domain/errors/ConflictError'
import { ValidationError } from '../../domain/errors/ValidationError'
import type { CooldownSettingsWriter } from '../contracts/CooldownSettingsWriter'
import type { UserEditor } from '../contracts/UserEditor'
import type { UserReader } from '../contracts/UserReader'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard'
import type { LastAdminGuard } from '../guards/LastAdminGuard'
import type { AdminUser, UserRole } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'
import { isUsableAdmin } from '../model/isUsableAdmin'
import type { UpdateUserInput } from '../model/userInputs'
import type { AdminUserPresenter } from '../presentation/AdminUserPresenter'

export class UpdateUserUseCase {
  constructor(
    private readonly userReader: UserReader,
    private readonly userEditor: UserEditor,
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
    const shouldResetPassword = this.decidePasswordReset(target, newRole, changes)
    await this.applyChanges(target, newRole, shouldResetPassword, changes)
    const updated = await this.userReader.find(target.id)
    return this.adminUserPresenter.presentUser(updated ?? target)
  }

  private async requireAllowedRoleChange(
    caller: DirectoryUser,
    target: DirectoryUser,
    newRole: UserRole | null,
  ): Promise<void> {
    if (!newRole) return
    if (target.id === caller.id) throw new ConflictError('admins cannot change their own role')
    if (isUsableAdmin(target)) await this.lastAdminGuard.requireAnotherAdmin()
  }

  private decidePasswordReset(
    target: DirectoryUser,
    newRole: UserRole | null,
    changes: UpdateUserInput,
  ): boolean {
    const canReset = !target.mustChangePassword && !target.federated
    if (changes.resetPassword && !canReset) {
      throw new ValidationError('the password cannot be reset in the current state of this user')
    }
    return canReset && (changes.resetPassword === true || newRole === 'admin')
  }

  private async applyChanges(
    target: DirectoryUser,
    newRole: UserRole | null,
    shouldResetPassword: boolean,
    changes: UpdateUserInput,
  ): Promise<void> {
    if (shouldResetPassword) await this.userEditor.forcePasswordReset(target.username)
    if (newRole) await this.userEditor.changeRole(target.username, target.role, newRole)
    if (changes.displayName !== undefined) {
      await this.userEditor.updateDisplayName(target.username, changes.displayName)
    }
    if (changes.cooldownHours !== undefined) {
      await this.cooldownSettingsWriter.writeCooldownHours(target.id, changes.cooldownHours)
    }
  }
}
