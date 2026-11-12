import { describe, expect, it } from 'vitest'
import { buildLocalBindings } from '../../src/local/buildLocalBindings'

function readClaims(authorization: string | null): Record<string, unknown> {
  const { event } = buildLocalBindings(authorization)
  return { ...event.requestContext.authorizer?.jwt.claims }
}

describe('buildLocalBindings', () => {
  it('builds the claims of a development token', () => {
    expect(readClaims('Bearer dev:user-1:admin,user')).toEqual({
      sub: 'user-1',
      'cognito:groups': '[admin user]',
    })
  })

  it('accepts a token without groups', () => {
    expect(readClaims('Bearer dev:user-1:')).toEqual({ sub: 'user-1', 'cognito:groups': '[]' })
  })

  it.each([
    ['a missing header', null],
    ['a real JWT', 'Bearer eyJhbGciOi.payload.signature'],
    ['an empty subject', 'Bearer dev::admin'],
    ['another scheme', 'Basic dev:user-1:admin'],
  ])('gives no claims for %s', (_label, authorization) => {
    expect(readClaims(authorization)).toEqual({})
  })
})
