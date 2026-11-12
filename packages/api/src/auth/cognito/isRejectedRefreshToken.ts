const REJECTED_TOKEN_ERROR_NAMES: readonly string[] = [
  'NotAuthorizedException',
  'UserNotFoundException',
]

function readErrorName(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null
  if ('code' in error && typeof error.code === 'string') return error.code
  if ('name' in error && typeof error.name === 'string') return error.name
  return null
}

export function isRejectedRefreshToken(error: unknown): boolean {
  const errorName = readErrorName(error)
  return errorName !== null && REJECTED_TOKEN_ERROR_NAMES.includes(errorName)
}
