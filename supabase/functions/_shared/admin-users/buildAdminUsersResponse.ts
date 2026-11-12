import { buildAdminErrorResponse } from './http/buildAdminErrorResponse.ts'
import type {
  AdminUsersRequest,
  AdminUsersResponse,
  AdminUsersUseCases,
} from './http/adminUsersContracts.ts'
import { routeAdminAction } from './http/routeAdminAction.ts'

export type { AdminUsersRequest, AdminUsersResponse, AdminUsersUseCases }

export async function buildAdminUsersResponse(
  request: AdminUsersRequest,
  useCases: AdminUsersUseCases,
  logUnexpectedFailure: (failure: unknown) => void = () => undefined,
): Promise<AdminUsersResponse> {
  if (request.method !== 'POST') {
    return { status: 405, body: { error: { code: 'method_not_allowed', message: 'use POST' } } }
  }
  try {
    return { status: 200, body: await routeAdminAction(request, useCases) }
  } catch (failure) {
    return buildAdminErrorResponse(failure, logUnexpectedFailure)
  }
}
