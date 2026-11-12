import { AdminGuard } from './AdminGuard.ts'
import type { AdminUsersUseCases } from './buildAdminUsersResponse.ts'
import type { UserDirectory } from './types.ts'
import { CreateUserUseCase } from './use-cases/CreateUserUseCase.ts'
import { DeleteUserUseCase } from './use-cases/DeleteUserUseCase.ts'
import { ListUsersUseCase } from './use-cases/ListUsersUseCase.ts'
import { UpdateUserUseCase } from './use-cases/UpdateUserUseCase.ts'

export function composeAdminUsersUseCases(userDirectory: UserDirectory): AdminUsersUseCases {
  const adminGuard = new AdminGuard(userDirectory)
  return {
    listUsersUseCase: new ListUsersUseCase(userDirectory, adminGuard),
    createUserUseCase: new CreateUserUseCase(userDirectory, adminGuard),
    updateUserUseCase: new UpdateUserUseCase(userDirectory, adminGuard),
    deleteUserUseCase: new DeleteUserUseCase(userDirectory, adminGuard),
  }
}
