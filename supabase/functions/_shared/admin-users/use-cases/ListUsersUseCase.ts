import type { AdminGuard } from '../AdminGuard.ts'
import type { AdminUser, UserDirectory } from '../types.ts'

export class ListUsersUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminGuard: AdminGuard,
  ) {}

  async listUsers(callerId: string | null): Promise<AdminUser[]> {
    await this.adminGuard.requireAdminCaller(callerId)
    return this.userDirectory.list()
  }
}
