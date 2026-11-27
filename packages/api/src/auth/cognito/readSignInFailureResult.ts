import type { SignInResult } from '../contracts/SignInResult'
import { readCognitoErrorName } from './readCognitoErrorName'

export function readSignInFailureResult(failure: unknown): SignInResult | null {
  const errorName = readCognitoErrorName(failure)
  if (errorName === 'UserNotConfirmedException') return { kind: 'unconfirmed_user' }
  if (errorName === 'PasswordResetRequiredException') return { kind: 'password_reset_required' }
  return null
}
