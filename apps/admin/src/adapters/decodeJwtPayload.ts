export type IdTokenPayload = {
  readonly sub?: string
  readonly email?: string
  readonly name?: string
  readonly 'cognito:groups'?: readonly string[]
}

function decodeBase64UrlText(base64UrlText: string): string {
  const base64Text = base64UrlText.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(base64Text), (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJwtPayload(token: string): IdTokenPayload | null {
  const payloadPart = token.split('.')[1]
  if (!payloadPart) return null
  try {
    return JSON.parse(decodeBase64UrlText(payloadPart)) as IdTokenPayload
  } catch {
    return null
  }
}
