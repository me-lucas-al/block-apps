type IdTokenClaims = { readonly sub?: unknown }

export function readIdTokenSubject(idToken: string): string | null {
  const payloadBase64 = idToken.split('.')[1]
  if (!payloadBase64) return null
  try {
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(payloadJson) as IdTokenClaims
    return typeof claims.sub === 'string' && claims.sub ? claims.sub : null
  } catch {
    return null
  }
}
