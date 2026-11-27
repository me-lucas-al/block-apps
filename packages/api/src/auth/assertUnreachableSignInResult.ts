export function assertUnreachableSignInResult(unhandledSignInResult: never): never {
  const unhandledKind: unknown =
    typeof unhandledSignInResult === 'object' && unhandledSignInResult !== null
      ? Reflect.get(unhandledSignInResult, 'kind')
      : unhandledSignInResult
  throw new Error(`Unhandled sign-in result kind: ${String(unhandledKind)}`)
}
