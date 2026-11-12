export function isCognitoError(error: unknown, errorName: string): boolean {
  return error instanceof Error && error.name === errorName
}
