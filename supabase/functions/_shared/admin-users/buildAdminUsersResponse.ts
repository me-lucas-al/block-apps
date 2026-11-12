import { AdminError } from './AdminError.ts'
import { parseUserId } from './parsing/fieldParsers.ts'
import { parseCreateUser, parseUpdateUser } from './parsing/parseUserInput.ts'
import type { CreateUserUseCase } from './use-cases/CreateUserUseCase.ts'
import type { DeleteUserUseCase } from './use-cases/DeleteUserUseCase.ts'
import type { ListUsersUseCase } from './use-cases/ListUsersUseCase.ts'
import type { UpdateUserUseCase } from './use-cases/UpdateUserUseCase.ts'

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

function readBodyField(body: unknown, field: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[field] : undefined
}

async function invokeRequestedUseCase(
  request: AdminUsersRequest,
  useCases: AdminUsersUseCases,
): Promise<unknown> {
  const { body, callerId } = request
  switch (readBodyField(body, 'action')) {
    case 'list':
      return { users: await useCases.listUsersUseCase.listUsers(callerId) }
    case 'create': {
      const newUser = parseCreateUser(readBodyField(body, 'user'))
      return { user: await useCases.createUserUseCase.createUser(callerId, newUser) }
    }
    case 'update': {
      const userId = parseUserId(readBodyField(body, 'id'))
      const changes = parseUpdateUser(readBodyField(body, 'user'))
      return { user: await useCases.updateUserUseCase.updateUser(callerId, userId, changes) }
    }
    case 'delete':
      await useCases.deleteUserUseCase.deleteUser(callerId, parseUserId(readBodyField(body, 'id')))
      return { ok: true }
    default:
      throw new AdminError('invalid_input', 'action must be list, create, update or delete')
  }
}

export async function buildAdminUsersResponse(
  request: AdminUsersRequest,
  useCases: AdminUsersUseCases,
  logUnexpectedFailure: (failure: unknown) => void = () => undefined,
): Promise<AdminUsersResponse> {
  if (request.method !== 'POST') {
    return { status: 405, body: { error: { code: 'method_not_allowed', message: 'use POST' } } }
  }
  try {
    return { status: 200, body: await invokeRequestedUseCase(request, useCases) }
  } catch (failure) {
    if (failure instanceof AdminError) {
      return { status: failure.status, body: { error: { code: failure.code, message: failure.message } } }
    }
    logUnexpectedFailure(failure)
    return { status: 500, body: { error: { code: 'internal', message: 'unexpected error' } } }
  }
}
