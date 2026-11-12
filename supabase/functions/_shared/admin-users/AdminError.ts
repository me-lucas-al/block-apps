export type AdminErrorCode =
  | 'unauthenticated'
  | 'forbidden'
  | 'password_change_required'
  | 'not_found'
  | 'invalid_input'
  | 'conflict'
  | 'self_action'
  | 'last_admin'

export class AdminError extends Error {
  constructor(
    readonly code: AdminErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AdminError'
  }
}
