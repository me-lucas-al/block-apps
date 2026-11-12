import { ConflictError } from '../../domain/errors/ConflictError'
import type { UserDataEraser } from '../contracts/UserDataEraser'
import type { UserRemover } from '../contracts/UserRemover'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard'
import type { LastAdminGuard } from '../guards/LastAdminGuard'
import { isUsableAdmin } from '../model/isUsableAdmin'

export class DeleteUserUseCase {
  constructor(
    private readonly userRemover: UserRemover,
    private readonly userDataEraser: UserDataEraser,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly existingUserGuard: ExistingUserGuard,
    private readonly lastAdminGuard: LastAdminGuard,
  ) {}

  async deleteUser(callerId: string, userId: string): Promise<void> {
    const caller = await this.adminCallerGuard.requireAdminCaller(callerId)
    const target = await this.existingUserGuard.requireExistingUser(userId)
    if (target.id === caller.id) throw new ConflictError('admins cannot delete their own account')
    if (isUsableAdmin(target)) await this.lastAdminGuard.requireAnotherAdmin()
    await this.userRemover.remove(target.username)
    await this.userDataEraser.eraseAllDataOf(target.id)
  }
}
