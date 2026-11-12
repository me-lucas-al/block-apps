import type { CooldownSettingsWriter } from '../contracts/CooldownSettingsWriter'
import type { UserWriter } from '../contracts/UserWriter'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { AdminUser } from '../model/AdminUser'
import type { CreateUserInput } from '../model/userInputs'
import type { AdminUserPresenter } from '../presentation/AdminUserPresenter'

export class CreateUserUseCase {
  constructor(
    private readonly userWriter: UserWriter,
    private readonly cooldownSettingsWriter: CooldownSettingsWriter,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly adminUserPresenter: AdminUserPresenter,
  ) {}

  async createUser(callerId: string, input: CreateUserInput): Promise<AdminUser> {
    await this.adminCallerGuard.requireAdminCaller(callerId)
    const created = await this.userWriter.create(input)
    await this.cooldownSettingsWriter.writeCooldownHours(created.id, input.cooldownHours)
    return this.adminUserPresenter.presentUser(created)
  }
}
