export type IdTokenPayload = {
  readonly sub?: string
  readonly email?: string
  readonly name?: string
  readonly 'cognito:groups'?: readonly string[]
}

export function decodeJwtPayload(token: string): IdTokenPayload | null {
  try {
    const parts = token.split('.')
    const payloadPart = parts[1]
    if (!payloadPart) return null
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(json) as IdTokenPayload
  } catch {
    return null
  }
}
