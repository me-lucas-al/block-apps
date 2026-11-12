export type AdminErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'password_change_required'
  | 'not_found'
  | 'invalid_input'
  | 'conflict'
  | 'self_action'
  | 'last_admin'

const STATUS_BY_CODE: Record<AdminErrorCode, number> = {
  unauthenticated: 401,
  forbidden: 403,
  password_change_required: 403,
  not_found: 404,
  invalid_input: 400,
  conflict: 409,
  self_action: 409,
  last_admin: 409,
}

export class AdminError extends Error {
  readonly status: number

  constructor(
    readonly code: AdminErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AdminError'
    this.status = STATUS_BY_CODE[code]
  }
}
