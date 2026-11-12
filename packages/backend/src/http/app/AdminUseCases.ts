import type { CreateUserUseCase } from '../../users/use-cases/CreateUserUseCase'
import type { DeleteUserUseCase } from '../../users/use-cases/DeleteUserUseCase'
import type { ListUsersUseCase } from '../../users/use-cases/ListUsersUseCase'
import type { UpdateUserUseCase } from '../../users/use-cases/UpdateUserUseCase'

export type AdminUseCases = {
  readonly listUsers: ListUsersUseCase
  readonly createUser: CreateUserUseCase
  readonly updateUser: UpdateUserUseCase
  readonly deleteUser: DeleteUserUseCase
}
