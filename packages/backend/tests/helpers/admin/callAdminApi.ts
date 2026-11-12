import { callApi, type ApiReply } from '../callApi'
import type { AdminBackend } from './buildAdminBackend'
import { ADMIN_ONE } from './userIds'

export function callAdminApi(
  backend: AdminBackend,
  method: string,
  path: string,
  body?: unknown,
  callerId = ADMIN_ONE,
): Promise<ApiReply> {
  return callApi(backend.app, { method, path, body, userId: callerId, groups: ['admin'] })
}
