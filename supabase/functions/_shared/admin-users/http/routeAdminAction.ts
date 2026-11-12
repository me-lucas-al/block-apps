import { AdminError } from '../AdminError.ts'
import { parseCreateUser } from '../parsing/body/parseCreateUser.ts'
import { parseUpdateUser } from '../parsing/body/parseUpdateUser.ts'
import { readBodyField } from '../parsing/body/readBodyField.ts'
import { parseUserId } from '../parsing/fields/parseUserId.ts'
import type { AdminUsersRequest, AdminUsersUseCases } from './adminUsersContracts.ts'

export async function routeAdminAction(
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
