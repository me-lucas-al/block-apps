import type { UserReader } from '../contracts/UserReader'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { AdminUser } from '../model/AdminUser'
import type { AdminUserPresenter } from '../presentation/AdminUserPresenter'

export class ListUsersUseCase {
  constructor(
    private readonly userReader: UserReader,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly adminUserPresenter: AdminUserPresenter,
  ) {}

  async listUsers(callerId: string): Promise<AdminUser[]> {
    await this.adminCallerGuard.requireAdminCaller(callerId)
    return this.adminUserPresenter.presentUsers(await this.userReader.list())
  }
}
