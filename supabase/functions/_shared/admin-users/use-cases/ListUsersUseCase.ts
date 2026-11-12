import type { AdminCallerGuard } from '../guards/AdminCallerGuard.ts'
import type { AdminUser } from '../model/adminUser.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'

export class ListUsersUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminCallerGuard: AdminCallerGuard,
  ) {}

  async listUsers(callerId: string | null): Promise<AdminUser[]> {
    await this.adminCallerGuard.requireAdminCaller(callerId)
    return this.userDirectory.list()
  }
}
