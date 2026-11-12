import { describe, expect, it } from 'vitest'
import { parseCreateUser } from '../../../../../supabase/functions/_shared/admin-users/parsing/body/parseCreateUser.ts'
import { parseUpdateUser } from '../../../../../supabase/functions/_shared/admin-users/parsing/body/parseUpdateUser.ts'

const VALID = { email: ' Ana@Example.com ', password: 'a-long-password' }

describe('parseCreateUser', () => {
  it('normalizes the email and applies safe defaults', () => {
    expect(parseCreateUser(VALID)).toEqual({
      email: 'ana@example.com',
      password: 'a-long-password',
      displayName: null,
      role: 'user',
      cooldownHours: 24,
      mustChangePassword: true,
    })
  })

  it('keeps the optional fields that were provided', () => {
    const parsed = parseCreateUser({
      ...VALID,
      displayName: '  Ana  ',
      role: 'admin',
      cooldownHours: 0,
      mustChangePassword: false,
    })
    expect(parsed).toMatchObject({
      displayName: 'Ana',
      role: 'admin',
      cooldownHours: 0,
      mustChangePassword: false,
    })
  })

  it.each([
    ['a missing email', { password: 'a-long-password' }, /email/],
    ['an invalid email', { ...VALID, email: 'not-an-email' }, /email/],
    ['a short password', { ...VALID, password: 'short' }, /password/],
    ['a password above 72 characters', { ...VALID, password: 'x'.repeat(73) }, /password/],
    ['an unknown role', { ...VALID, role: 'root' }, /role/],
    ['a fractional cooldown', { ...VALID, cooldownHours: 1.5 }, /cooldownHours/],
    ['a cooldown above 168 hours', { ...VALID, cooldownHours: 169 }, /cooldownHours/],
    ['a negative cooldown', { ...VALID, cooldownHours: -1 }, /cooldownHours/],
    ['a long display name', { ...VALID, displayName: 'x'.repeat(81) }, /displayName/],
    ['a non boolean flag', { ...VALID, mustChangePassword: 'yes' }, /mustChangePassword/],
    ['a body that is not an object', 'text', /body/],
  ])('rejects %s', (_name, input, message) => {
    expect(() => parseCreateUser(input)).toThrow(message)
  })
})

describe('parseUpdateUser', () => {
  it('only returns the fields that were provided', () => {
    expect(parseUpdateUser({ displayName: 'Ana' })).toEqual({ displayName: 'Ana' })
  })

  it('turns a blank display name into null', () => {
    expect(parseUpdateUser({ displayName: '   ' })).toEqual({ displayName: null })
  })

  it('rejects an empty update', () => {
    expect(() => parseUpdateUser({})).toThrow(/at least one field/)
  })

  it('validates provided fields with the same rules as creation', () => {
    expect(() => parseUpdateUser({ password: 'short' })).toThrow(/password/)
    expect(() => parseUpdateUser({ role: 'root' })).toThrow(/role/)
  })
})
