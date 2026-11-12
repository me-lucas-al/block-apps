import type { CooldownSettingsWriter } from '../contracts/CooldownSettingsWriter'
import type { UserCreator } from '../contracts/UserCreator'
import type { UserRemover } from '../contracts/UserRemover'
import type { AdminCallerGuard } from '../guards/AdminCallerGuard'
import type { AdminUser } from '../model/AdminUser'
import type { DirectoryUser } from '../model/DirectoryUser'
import type { CreateUserInput } from '../model/userInputs'
import type { AdminUserPresenter } from '../presentation/AdminUserPresenter'

export class CreateUserUseCase {
  constructor(
    private readonly userCreator: UserCreator,
    private readonly userRemover: UserRemover,
    private readonly cooldownSettingsWriter: CooldownSettingsWriter,
    private readonly adminCallerGuard: AdminCallerGuard,
    private readonly adminUserPresenter: AdminUserPresenter,
  ) {}

  async createUser(callerId: string, input: CreateUserInput): Promise<AdminUser> {
    await this.adminCallerGuard.requireAdminCaller(callerId)
    const created = await this.userCreator.create(input)
    await this.storeCooldownOrUndo(created, input.cooldownHours)
    return this.adminUserPresenter.presentUser(created)
  }

  private async storeCooldownOrUndo(created: DirectoryUser, cooldownHours: number): Promise<void> {
    try {
      await this.cooldownSettingsWriter.writeCooldownHours(created.id, cooldownHours)
    } catch (error: unknown) {
      await this.userRemover.remove(created.username).catch(() => {
        console.error(JSON.stringify({ message: 'could not undo user creation', userId: created.id }))
      })
      throw error
    }
  }
}
