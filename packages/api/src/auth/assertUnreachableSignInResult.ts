export function assertUnreachableSignInResult(unhandledSignInResult: never): never {
  throw new Error(`Unhandled sign-in result: ${JSON.stringify(unhandledSignInResult)}`)
}
