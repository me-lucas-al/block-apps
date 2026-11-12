import type { CooldownSettingsStore } from '../cooldown/contracts/CooldownSettingsStore'
import type { AdminUseCases } from '../http/app/AdminUseCases'
import { AdminCallerGuard } from '../users/guards/AdminCallerGuard'
import { ExistingUserGuard } from '../users/guards/ExistingUserGuard'
import { LastAdminGuard } from '../users/guards/LastAdminGuard'
import { AdminUserPresenter } from '../users/presentation/AdminUserPresenter'
import { CreateUserUseCase } from '../users/use-cases/CreateUserUseCase'
import { DeleteUserUseCase } from '../users/use-cases/DeleteUserUseCase'
import { ListUsersUseCase } from '../users/use-cases/ListUsersUseCase'
import { UpdateUserUseCase } from '../users/use-cases/UpdateUserUseCase'
import type { CooldownSettingsWriter } from '../users/contracts/CooldownSettingsWriter'
import type { UserDataEraser } from '../users/contracts/UserDataEraser'
import type { UserReader } from '../users/contracts/UserReader'
import type { UserWriter } from '../users/contracts/UserWriter'

export type AdminCollaborators = {
  readonly userReader: UserReader
  readonly userWriter: UserWriter
  readonly userDataEraser: UserDataEraser
  readonly cooldownSettingsStore: CooldownSettingsStore
  readonly cooldownSettingsWriter: CooldownSettingsWriter
}

export function createAdminUseCases(collaborators: AdminCollaborators): AdminUseCases {
  const { userReader, userWriter, userDataEraser, cooldownSettingsWriter } = collaborators
  const adminCallerGuard = new AdminCallerGuard(userReader)
  const existingUserGuard = new ExistingUserGuard(userReader)
  const lastAdminGuard = new LastAdminGuard(userReader)
  const adminUserPresenter = new AdminUserPresenter(collaborators.cooldownSettingsStore)
  return {
    listUsers: new ListUsersUseCase(userReader, adminCallerGuard, adminUserPresenter),
    createUser: new CreateUserUseCase(userWriter, cooldownSettingsWriter, adminCallerGuard, adminUserPresenter),
    updateUser: new UpdateUserUseCase(
      userReader,
      userWriter,
      cooldownSettingsWriter,
      adminCallerGuard,
      existingUserGuard,
      lastAdminGuard,
      adminUserPresenter,
    ),
    deleteUser: new DeleteUserUseCase(
      userWriter,
      userDataEraser,
      adminCallerGuard,
      existingUserGuard,
      lastAdminGuard,
    ),
  }
}
