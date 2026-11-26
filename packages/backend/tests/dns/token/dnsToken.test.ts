import { describe, expect, it } from 'vitest'
import { isWellFormedDnsToken } from '../../../src/dns/token/dnsTokenFormat'
import { generateDnsToken } from '../../../src/dns/token/generateDnsToken'
import { hashDnsToken } from '../../../src/dns/token/hashDnsToken'

describe('generateDnsToken', () => {
  it('produces 43 characters of the base64url alphabet', () => {
    expect(generateDnsToken()).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('produces a different token on each call', () => {
    expect(generateDnsToken()).not.toBe(generateDnsToken())
  })
})

describe('isWellFormedDnsToken', () => {
  it('accepts every token the generator produces', () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      expect(isWellFormedDnsToken(generateDnsToken())).toBe(true)
    }
  })

  it('rejects the wrong length and characters outside base64url', () => {
    const validToken = generateDnsToken()
    expect(isWellFormedDnsToken('')).toBe(false)
    expect(isWellFormedDnsToken(validToken.slice(1))).toBe(false)
    expect(isWellFormedDnsToken(`${validToken}a`)).toBe(false)
    expect(isWellFormedDnsToken(`${validToken.slice(1)}=`)).toBe(false)
    expect(isWellFormedDnsToken(`${validToken.slice(1)}/`)).toBe(false)
  })
})

describe('hashDnsToken', () => {
  it('returns the SHA-256 of the token as lowercase hex', () => {
    expect(hashDnsToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('returns the same hash for the same token and another for a different token', () => {
    expect(hashDnsToken('token-a')).toBe(hashDnsToken('token-a'))
    expect(hashDnsToken('token-a')).not.toBe(hashDnsToken('token-b'))
  })
})
