import type { UserType } from '@aws-sdk/client-cognito-identity-provider'
import { describe, expect, it } from 'vitest'
import {
  buildEmailFilter,
  findLinkableNativeUser,
} from '../../src/storage/cognito/findLinkableNativeUser'

function makeUser(overrides: Partial<UserType> = {}): UserType {
  return {
    Username: 'native-user-id',
    UserStatus: 'CONFIRMED',
    Enabled: true,
    Attributes: [{ Name: 'email_verified', Value: 'true' }],
    ...overrides,
  }
}

describe('findLinkableNativeUser', () => {
  it('returns the confirmed native user with a verified email', () => {
    expect(findLinkableNativeUser([makeUser()])).toEqual({ username: 'native-user-id' })
  })

  it.each([
    ['is not confirmed', makeUser({ UserStatus: 'UNCONFIRMED' })],
    ['is disabled', makeUser({ Enabled: false })],
    ['has no verified email', makeUser({ Attributes: [{ Name: 'email_verified', Value: 'false' }] })],
    ['is a federated user', makeUser({ Username: 'Google_123', UserStatus: 'EXTERNAL_PROVIDER' })],
  ])('ignores a user that %s', (_reason, user) => {
    expect(findLinkableNativeUser([user])).toBeNull()
  })

  it('skips unlinkable users and picks the linkable one', () => {
    const unconfirmedUser = makeUser({ Username: 'attacker-id', UserStatus: 'UNCONFIRMED' })

    expect(findLinkableNativeUser([unconfirmedUser, makeUser()])).toEqual({
      username: 'native-user-id',
    })
  })
})

describe('buildEmailFilter', () => {
  it('wraps the email in a Cognito filter expression', () => {
    expect(buildEmailFilter('user@example.com')).toBe('email = "user@example.com"')
  })

  it('escapes quotes and backslashes', () => {
    expect(buildEmailFilter('a"b\\c@example.com')).toBe('email = "a\\"b\\\\c@example.com"')
  })
})
