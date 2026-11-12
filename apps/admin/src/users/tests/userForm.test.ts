import { describe, expect, it } from 'vitest'
import type { AdminUser } from '../../ports/userTypes'
import { EMPTY_USER_FORM, formFromUser, toCreateInput, toUpdateInput } from '../userForm'

const USER: AdminUser = {
  id: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
  role: 'user',
  cooldownHours: 24,
  mustChangePassword: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  lastSignInAt: null,
}

describe('userForm', () => {
  it('starts with safe defaults for a new user', () => {
    expect(EMPTY_USER_FORM).toMatchObject({ role: 'user', cooldownHours: '24', mustChangePassword: true })
  })

  it('builds the create payload with a numeric cooldown and null for a blank name', () => {
    const input = toCreateInput({
      ...EMPTY_USER_FORM,
      email: 'new@example.com',
      password: 'a-long-password',
      cooldownHours: '48',
      displayName: '   ',
    })
    expect(input).toEqual({
      email: 'new@example.com',
      password: 'a-long-password',
      displayName: null,
      role: 'user',
      cooldownHours: 48,
      mustChangePassword: true,
    })
  })

  it('loads an existing user into the form without exposing a password', () => {
    expect(formFromUser(USER)).toEqual({
      email: 'ana@example.com',
      displayName: 'Ana',
      role: 'user',
      cooldownHours: '24',
      password: '',
      mustChangePassword: false,
    })
  })

  it('sends nothing when an edit changed nothing', () => {
    expect(toUpdateInput(formFromUser(USER), USER)).toEqual({})
  })

  it('sends only the fields that changed', () => {
    const form = { ...formFromUser(USER), role: 'admin' as const, cooldownHours: '0' }
    expect(toUpdateInput(form, USER)).toEqual({ role: 'admin', cooldownHours: 0 })
  })

  it('sends the password only when a new one was typed', () => {
    const form = { ...formFromUser(USER), password: 'another-password' }
    expect(toUpdateInput(form, USER)).toEqual({ password: 'another-password' })
  })

  it('clears the display name by sending null', () => {
    const form = { ...formFromUser(USER), displayName: '' }
    expect(toUpdateInput(form, USER)).toEqual({ displayName: null })
  })
})
