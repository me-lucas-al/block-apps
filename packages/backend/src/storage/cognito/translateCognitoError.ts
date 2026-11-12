import { ConflictError } from '../../domain/errors/ConflictError'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import { ValidationError } from '../../domain/errors/ValidationError'

export function translateCognitoError(error: unknown): unknown {
  if (!(error instanceof Error)) return error
  if (error.name === 'UserNotFoundException') return new NotFoundError('user not found')
  if (error.name === 'UsernameExistsException') {
    return new ConflictError('a user with this email already exists')
  }
  if (error.name === 'InvalidParameterException') {
    return new ValidationError('the user directory rejected this request')
  }
  return error
}

export async function withTranslatedErrors<Outcome>(operation: () => Promise<Outcome>): Promise<Outcome> {
  try {
    return await operation()
  } catch (error: unknown) {
    throw translateCognitoError(error)
  }
}
