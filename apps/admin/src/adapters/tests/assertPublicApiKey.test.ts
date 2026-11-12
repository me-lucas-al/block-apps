import { describe, expect, it } from 'vitest'
import { assertPublicApiKey } from '../assertPublicApiKey'

function jwtWithRole(role: string): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '')
  return `${encode({ alg: 'HS256' })}.${encode({ role })}.signature`
}

describe('assertPublicApiKey', () => {
  it('accepts an anon JWT and a publishable key', () => {
    expect(() => assertPublicApiKey(jwtWithRole('anon'))).not.toThrow()
    expect(() => assertPublicApiKey('sb_publishable_abc')).not.toThrow()
  })

  it('refuses a service role JWT', () => {
    expect(() => assertPublicApiKey(jwtWithRole('service_role'))).toThrow(/secret/)
  })

  it('refuses a new style secret key', () => {
    expect(() => assertPublicApiKey('sb_secret_abc')).toThrow(/secret/)
  })

  it('does not choke on values that are not JWTs', () => {
    expect(() => assertPublicApiKey('placeholder')).not.toThrow()
    expect(() => assertPublicApiKey('a.not-base64!.c')).not.toThrow()
  })
})
