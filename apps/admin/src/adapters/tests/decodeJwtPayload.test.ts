import { describe, expect, it } from 'vitest'
import { decodeJwtPayload } from '../decodeJwtPayload'

describe('decodeJwtPayload', () => {
  it('returns parsed payload for valid jwt', () => {
    const payload = { sub: 'user-123', email: 'test@blockapps.com', 'cognito:groups': ['admin'] }
    const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`

    const decoded = decodeJwtPayload(token)
    expect(decoded).toEqual(payload)
  })

  it('returns null for invalid jwt', () => {
    expect(decodeJwtPayload('invalid')).toBeNull()
    expect(decodeJwtPayload('a.not-json.c')).toBeNull()
  })
})
