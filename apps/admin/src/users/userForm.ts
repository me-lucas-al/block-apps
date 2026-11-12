import type { AdminUser, CreateUserInput, UpdateUserInput, UserRole } from '../ports/userTypes'

export type UserFormState = {
  email: string
  displayName: string
  role: UserRole
  cooldownHours: string
  mustChangePassword: boolean
}

export const EMPTY_USER_FORM: UserFormState = {
  email: '',
  displayName: '',
  role: 'user',
  cooldownHours: '24',
  mustChangePassword: true,
}

export function formFromUser(user: AdminUser): UserFormState {
  return {
    email: user.email,
    displayName: user.displayName ?? '',
    role: user.role,
    cooldownHours: String(user.cooldownHours),
    mustChangePassword: user.mustChangePassword,
  }
}

export function toCreateInput(form: UserFormState): CreateUserInput {
  return {
    email: form.email.trim(),
    displayName: form.displayName.trim() === '' ? null : form.displayName.trim(),
    role: form.role,
    cooldownHours: Number(form.cooldownHours),
  }
}

export function toUpdateInput(form: UserFormState, original: AdminUser): UpdateUserInput {
  const next = toCreateInput(form)
  const changes: { -readonly [Key in keyof UpdateUserInput]: UpdateUserInput[Key] } = {}
  if (next.displayName !== original.displayName) changes.displayName = next.displayName
  if (next.role !== original.role) changes.role = next.role
  if (next.cooldownHours !== original.cooldownHours) changes.cooldownHours = next.cooldownHours
  if (form.mustChangePassword && !original.mustChangePassword) {
    changes.resetPassword = true
  }
  return changes
}
