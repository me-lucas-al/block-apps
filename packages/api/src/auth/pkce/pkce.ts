import type { PkceCrypto } from './PkceCrypto'

const UNRESERVED_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'

export function generateRandomString(pkceCrypto: PkceCrypto, length: number): string {
  const randomBytes = pkceCrypto.randomBytes(length)
  return Array.from(randomBytes, (byte) => UNRESERVED_CHARACTERS[byte % UNRESERVED_CHARACTERS.length]).join('')
}

export async function generateCodeChallenge(
  pkceCrypto: PkceCrypto,
  verifier: string,
): Promise<string> {
  const digestBase64 = await pkceCrypto.sha256Base64(verifier)
  return digestBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
