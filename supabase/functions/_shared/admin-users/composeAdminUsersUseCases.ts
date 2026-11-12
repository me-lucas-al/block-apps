import { AdminCallerGuard } from './guards/AdminCallerGuard.ts'
import { ExistingUserGuard } from './guards/ExistingUserGuard.ts'
import type { AdminUsersUseCases } from './http/adminUsersContracts.ts'
import type { UserDirectory } from './model/UserDirectory.ts'
import { CreateUserUseCase } from './use-cases/CreateUserUseCase.ts'
import { DeleteUserUseCase } from './use-cases/DeleteUserUseCase.ts'
import { ListUsersUseCase } from './use-cases/ListUsersUseCase.ts'
import { UpdateUserUseCase } from './use-cases/UpdateUserUseCase.ts'

export function composeAdminUsersUseCases(userDirectory: UserDirectory): AdminUsersUseCases {
  const adminCallerGuard = new AdminCallerGuard(userDirectory)
  const existingUserGuard = new ExistingUserGuard(userDirectory)
  return {
    listUsersUseCase: new ListUsersUseCase(userDirectory, adminCallerGuard),
    createUserUseCase: new CreateUserUseCase(userDirectory, adminCallerGuard),
    updateUserUseCase: new UpdateUserUseCase(userDirectory, adminCallerGuard, existingUserGuard),
    deleteUserUseCase: new DeleteUserUseCase(userDirectory, adminCallerGuard, existingUserGuard),
  }
}
