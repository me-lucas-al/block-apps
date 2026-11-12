import { callApi, type ApiReply } from '../callApi'
import type { AdminBackend } from './buildAdminBackend'

export function callAdminApi(
  backend: AdminBackend,
  method: string,
  path: string,
  body?: unknown,
  callerId = 'admin-1',
): Promise<ApiReply> {
  return callApi(backend.app, { method, path, body, userId: callerId, groups: ['admin'] })
}
