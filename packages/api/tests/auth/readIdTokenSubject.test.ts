import { describe, expect, it } from 'vitest'
import { readIdTokenSubject } from '../../src/auth/session/readIdTokenSubject'

function buildToken(claims: object): string {
  const payload = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${payload}.signature`
}

describe('readIdTokenSubject', () => {
  it('reads the sub claim', () => {
    expect(readIdTokenSubject(buildToken({ sub: 'abc-123', email: 'a@b.c' }))).toBe('abc-123')
  })

  it('returns null when the token has no sub', () => {
    expect(readIdTokenSubject(buildToken({ email: 'a@b.c' }))).toBeNull()
  })

  it('returns null for a malformed token', () => {
    expect(readIdTokenSubject('not-a-token')).toBeNull()
    expect(readIdTokenSubject('a.%%%.c')).toBeNull()
  })

  it('reads tokens whose base64url payload has no padding', () => {
    const payload = btoa(JSON.stringify({ sub: 'sub-with-padding-x' })).replace(/=+$/, '')
    expect(readIdTokenSubject(`h.${payload}.s`)).toBe('sub-with-padding-x')
  })
})
