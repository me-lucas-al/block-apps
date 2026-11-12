import { ConflictError } from '../../domain/errors/ConflictError'
import type { UserDataEraser } from '../contracts/UserDataEraser'
import type { UserWriter } from '../contracts/UserWriter'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { ExistingUserGuard } from '../guards/ExistingUserGuard'
import type { LastAdminGuard } from '../guards/LastAdminGuard'

export class DeleteUserUseCase {
  constructor(
    private readonly userWriter: UserWriter,
    private readonly userDataEraser: UserDataEraser,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly existingUserGuard: ExistingUserGuard,
    private readonly lastAdminGuard: LastAdminGuard,
  ) {}

  async deleteUser(callerId: string, userId: string): Promise<void> {
    const caller = await this.adminCallerGuard.requireAdminCaller(callerId)
    if (userId === caller.id) throw new ConflictError('admins cannot delete their own account')
    const target = await this.existingUserGuard.requireExistingUser(userId)
    if (target.role === 'admin' && target.enabled) await this.lastAdminGuard.requireAnotherAdmin()
    await this.userWriter.remove(userId)
    await this.userDataEraser.eraseAllDataOf(userId)
  }
}
