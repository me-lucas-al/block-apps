type IdTokenClaims = { readonly sub?: unknown }

export function readIdTokenSubject(idToken: string): string | null {
  const payloadBase64 = idToken.split('.')[1]
  if (!payloadBase64) return null
  try {
    const standardBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = standardBase64.padEnd(Math.ceil(standardBase64.length / 4) * 4, '=')
    const payloadJson = atob(paddedBase64)
    const claims = JSON.parse(payloadJson) as IdTokenClaims
    return typeof claims.sub === 'string' && claims.sub ? claims.sub : null
  } catch {
    return null
  }
}
