import type { CooldownSettingsStore } from '../cooldown/contracts/CooldownSettingsStore'
import type { AdminUseCases } from '../http/app/AdminUseCases'
import type { CooldownSettingsWriter } from '../users/contracts/CooldownSettingsWriter'
import type { UserCreator } from '../users/contracts/UserCreator'
import type { UserDataEraser } from '../users/contracts/UserDataEraser'
import type { UserEditor } from '../users/contracts/UserEditor'
import type { UserReader } from '../users/contracts/UserReader'
import type { UserRemover } from '../users/contracts/UserRemover'
import { AdminCallerGuard } from '../users/guards/AdminCallerGuard'
import { ExistingUserGuard } from '../users/guards/ExistingUserGuard'
import { LastAdminGuard } from '../users/guards/LastAdminGuard'
import { AdminUserPresenter } from '../users/presentation/AdminUserPresenter'
import { CreateUserUseCase } from '../users/use-cases/CreateUserUseCase'
import { DeleteUserUseCase } from '../users/use-cases/DeleteUserUseCase'
import { ListUsersUseCase } from '../users/use-cases/ListUsersUseCase'
import { UpdateUserUseCase } from '../users/use-cases/UpdateUserUseCase'

export type AdminCollaborators = {
  readonly userReader: UserReader
  readonly userCreator: UserCreator
  readonly userEditor: UserEditor
  readonly userRemover: UserRemover
  readonly userDataEraser: UserDataEraser
  readonly cooldownSettingsStore: CooldownSettingsStore
  readonly cooldownSettingsWriter: CooldownSettingsWriter
}

export type AdminUseCasesOptions = {
  readonly requireMfa?: boolean
}

export function createAdminUseCases(
  collaborators: AdminCollaborators,
  options?: AdminUseCasesOptions,
): AdminUseCases {
  const { userReader, userCreator, userEditor, userRemover, cooldownSettingsWriter } = collaborators
  const requireMfa = options?.requireMfa ?? process.env['ADMIN_REQUIRE_MFA'] !== 'false'
  const adminCallerGuard = new AdminCallerGuard(userReader, requireMfa)
  const existingUserGuard = new ExistingUserGuard(userReader)
  const lastAdminGuard = new LastAdminGuard(userReader)
  const presenter = new AdminUserPresenter(collaborators.cooldownSettingsStore)
  return {
    listUsers: new ListUsersUseCase(userReader, adminCallerGuard, presenter),
    createUser: new CreateUserUseCase(
      userCreator,
      userRemover,
      cooldownSettingsWriter,
      adminCallerGuard,
      presenter,
    ),
    updateUser: new UpdateUserUseCase(
      userReader,
      userEditor,
      cooldownSettingsWriter,
      adminCallerGuard,
      existingUserGuard,
      lastAdminGuard,
      presenter,
    ),
    deleteUser: new DeleteUserUseCase(
      userRemover,
      collaborators.userDataEraser,
      adminCallerGuard,
      existingUserGuard,
      lastAdminGuard,
    ),
  }
}
