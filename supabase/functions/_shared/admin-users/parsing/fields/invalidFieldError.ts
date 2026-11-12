import { AdminError } from '../../AdminError.ts'

export function invalidFieldError(field: string, requirement: string): AdminError {
  return new AdminError('invalid_input', `${field} ${requirement}`)
}
