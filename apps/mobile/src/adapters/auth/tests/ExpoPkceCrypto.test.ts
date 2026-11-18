import { describe, expect, it, vi } from 'vitest'
import { ExpoPkceCrypto } from '../ExpoPkceCrypto'

vi.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { BASE64: 'base64' },
  getRandomBytes: (length: number) => new Uint8Array(length).fill(2),
  digestStringAsync: async () => 'ab+/cd==',
}))

describe('ExpoPkceCrypto', () => {
  it('provides random bytes of the requested length', () => {
    expect(new ExpoPkceCrypto().randomBytes(4)).toEqual(new Uint8Array([2, 2, 2, 2]))
  })

  it('returns the sha256 digest encoded as base64', async () => {
    expect(await new ExpoPkceCrypto().sha256Base64('verifier')).toBe('ab+/cd==')
  })
})
