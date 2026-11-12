import type { AdminGuard } from '../AdminGuard.ts'
import type { AdminUser, CreateUserInput, UserDirectory } from '../types.ts'

export class CreateUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminGuard: AdminGuard,
  ) {}

  async createUser(callerId: string | null, newUser: CreateUserInput): Promise<AdminUser> {
    await this.adminGuard.requireAdminCaller(callerId)
    return this.userDirectory.create(newUser)
  }
}
