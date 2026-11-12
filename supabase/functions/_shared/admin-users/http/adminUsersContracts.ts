import type { CreateUserUseCase } from '../use-cases/CreateUserUseCase.ts'
import type { DeleteUserUseCase } from '../use-cases/DeleteUserUseCase.ts'
import type { ListUsersUseCase } from '../use-cases/ListUsersUseCase.ts'
import type { UpdateUserUseCase } from '../use-cases/UpdateUserUseCase.ts'

export type AdminUsersUseCases = {
  readonly listUsersUseCase: ListUsersUseCase
  readonly createUserUseCase: CreateUserUseCase
  readonly updateUserUseCase: UpdateUserUseCase
  readonly deleteUserUseCase: DeleteUserUseCase
}

export type AdminUsersRequest = {
  readonly method: string
  readonly callerId: string | null
  readonly body: unknown
}

export type AdminUsersResponse = {
  readonly status: number
  readonly body: unknown
}
