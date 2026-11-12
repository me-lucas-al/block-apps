import type { AdminCallerGuard } from '../guards/AdminCallerGuard.ts'
import type { AdminUser } from '../model/adminUser.ts'
import type { UserDirectory } from '../model/UserDirectory.ts'
import type { CreateUserInput } from '../model/userInputs.ts'

export class CreateUserUseCase {
  constructor(
    private readonly userDirectory: UserDirectory,
    private readonly adminCallerGuard: AdminCallerGuard,
  ) {}

  async createUser(callerId: string | null, newUser: CreateUserInput): Promise<AdminUser> {
    await this.adminCallerGuard.requireAdminCaller(callerId)
    return this.userDirectory.create(newUser)
  }
}
