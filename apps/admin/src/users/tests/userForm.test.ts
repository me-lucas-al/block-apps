import { describe, expect, it } from 'vitest'
import type { AdminUser } from '../../ports/userTypes'
import {
  EMPTY_USER_FORM,
  formFromUser,
  toCreateInput,
  toUpdateInput,
} from '../userForm'

const SAMPLE_USER: AdminUser = {
  id: 'u-1',
  email: 'ana@example.com',
  displayName: 'Ana',
  role: 'user',
  cooldownHours: 12,
  mustChangePassword: false,
  createdAt: '2026-04-10T10:00:00Z',
}

describe('userForm', () => {
  it('builds an empty form with defaults', () => {
    expect(EMPTY_USER_FORM.email).toBe('')
    expect(EMPTY_USER_FORM.role).toBe('user')
    expect(EMPTY_USER_FORM.cooldownHours).toBe('24')
    expect(EMPTY_USER_FORM.mustChangePassword).toBe(true)
  })

  it('populates form from existing user', () => {
    const form = formFromUser(SAMPLE_USER)
    expect(form.email).toBe('ana@example.com')
    expect(form.displayName).toBe('Ana')
    expect(form.role).toBe('user')
    expect(form.cooldownHours).toBe('12')
    expect(form.mustChangePassword).toBe(false)
  })

  it('converts form to create input with normalized values', () => {
    const input = toCreateInput({
      email: '  test@example.com ',
      displayName: '   ',
      role: 'admin',
      cooldownHours: '48',
      mustChangePassword: true,
    })
    expect(input.email).toBe('test@example.com')
    expect(input.displayName).toBeNull()
    expect(input.role).toBe('admin')
    expect(input.cooldownHours).toBe(48)
  })

  it('computes update input containing only changed fields', () => {
    const changes = toUpdateInput(
      {
        email: 'ana@example.com',
        displayName: 'Ana Silva',
        role: 'user',
        cooldownHours: '12',
        mustChangePassword: false,
      },
      SAMPLE_USER,
    )
    expect(changes).toEqual({ displayName: 'Ana Silva' })
  })

  it('includes resetPassword when mustChangePassword becomes true', () => {
    const changes = toUpdateInput(
      {
        email: 'ana@example.com',
        displayName: 'Ana',
        role: 'user',
        cooldownHours: '12',
        mustChangePassword: true,
      },
      SAMPLE_USER,
    )
    expect(changes).toEqual({ resetPassword: true })
  })
})
