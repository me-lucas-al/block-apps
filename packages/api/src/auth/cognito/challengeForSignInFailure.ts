import type { AuthChallenge } from '../contracts/AuthResult'
import { readErrorName } from './readErrorName'

export function challengeForSignInFailure(error: unknown): AuthChallenge | null {
  const errorName = readErrorName(error)
  if (errorName === 'PasswordResetRequiredException') return { kind: 'RESET_REQUIRED' }
  if (errorName === 'UserNotConfirmedException') return { kind: 'CONFIRMATION_REQUIRED' }
  return null
}
