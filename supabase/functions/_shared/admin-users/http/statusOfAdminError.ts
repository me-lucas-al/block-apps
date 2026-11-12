import type { AdminErrorCode } from '../AdminError.ts'

const STATUS_BY_ERROR_CODE: Record<AdminErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  password_change_required: 403,
  not_found: 404,
  invalid_input: 400,
  conflict: 409,
  self_action: 409,
  last_admin: 409,
}

export function statusOfAdminError(code: AdminErrorCode): number {
  return STATUS_BY_ERROR_CODE[code]
}
