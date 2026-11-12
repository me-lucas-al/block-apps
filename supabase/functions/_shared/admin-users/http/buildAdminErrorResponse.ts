import { AdminError } from '../AdminError.ts'
import type { AdminUsersResponse } from './adminUsersContracts.ts'
import { statusOfAdminError } from './statusOfAdminError.ts'

export function buildAdminErrorResponse(
  failure: unknown,
  logUnexpectedFailure: (failure: unknown) => void,
): AdminUsersResponse {
  if (failure instanceof AdminError) {
    return {
      status: statusOfAdminError(failure.code),
      body: { error: { code: failure.code, message: failure.message } },
    }
  }
  logUnexpectedFailure(failure)
  return { status: 500, body: { error: { code: 'internal', message: 'unexpected error' } } }
}
