import { describe, expect, it } from 'vitest'
import { buildTotpUri } from '../../src/auth/buildTotpUri'

describe('buildTotpUri', () => {
  it('builds an otpauth uri with issuer and secret', () => {
    const uri = buildTotpUri('admin@example.com', 'ABC234', 'Block Apps')
    expect(uri).toBe('otpauth://totp/Block%20Apps:admin%40example.com?secret=ABC234&issuer=Block%20Apps')
  })
})
