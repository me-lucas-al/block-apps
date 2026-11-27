import { readCognitoErrorName } from './readCognitoErrorName'

const REJECTED_TOKEN_ERROR_NAMES: readonly string[] = [
  'NotAuthorizedException',
  'UserNotFoundException',
]

export function isRejectedRefreshToken(error: unknown): boolean {
  const errorName = readCognitoErrorName(error)
  return errorName !== null && REJECTED_TOKEN_ERROR_NAMES.includes(errorName)
}
