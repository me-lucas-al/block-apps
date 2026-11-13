import { describe, expect, it } from 'vitest'
import type { PkceCrypto } from '../../src/auth/pkce/PkceCrypto'
import { generateCodeChallenge, generateRandomString } from '../../src/auth/pkce/pkce'
import { WebPkceCrypto } from '../../src/auth/pkce/WebPkceCrypto'

const fixedCrypto: PkceCrypto = {
  randomBytes: (length) => new Uint8Array(length).fill(1),
  sha256Base64: async () => 'ab+/cd==',
}

describe('pkce', () => {
  it('builds a random string of the requested length from the injected bytes', () => {
    expect(generateRandomString(fixedCrypto, 5)).toBe('BBBBB')
  })

  it('turns the base64 digest into an unpadded base64url challenge', async () => {
    expect(await generateCodeChallenge(fixedCrypto, 'verifier')).toBe('ab-_cd')
  })

  it('matches the RFC 7636 example with the web crypto implementation', async () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'

    const challenge = await generateCodeChallenge(new WebPkceCrypto(), verifier)

    expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  })

  it('uses only unreserved characters with the web crypto implementation', () => {
    const generated = generateRandomString(new WebPkceCrypto(), 200)

    expect(generated).toMatch(/^[A-Za-z0-9\-._~]{200}$/)
  })
})
