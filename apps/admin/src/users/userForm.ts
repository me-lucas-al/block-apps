import type { AdminUser, CreateUserInput, UpdateUserInput, UserRole } from '../ports/userTypes'

export type UserFormState = {
  email: string
  displayName: string
  role: UserRole
  cooldownHours: string
  password: string
  mustChangePassword: boolean
}

export const EMPTY_USER_FORM: UserFormState = {
  email: '',
  displayName: '',
  role: 'user',
  cooldownHours: '24',
  password: '',
  mustChangePassword: true,
}

export function formFromUser(user: AdminUser): UserFormState {
  return {
    email: user.email,
    displayName: user.displayName ?? '',
    role: user.role,
    cooldownHours: String(user.cooldownHours),
    password: '',
    mustChangePassword: user.mustChangePassword,
  }
}

export function toCreateInput(form: UserFormState): CreateUserInput {
  return {
    email: form.email,
    password: form.password,
    displayName: form.displayName.trim() === '' ? null : form.displayName,
    role: form.role,
    cooldownHours: Number(form.cooldownHours),
    mustChangePassword: form.mustChangePassword,
  }
}

export function toUpdateInput(form: UserFormState, original: AdminUser): UpdateUserInput {
  const next = toCreateInput(form)
  const changes: { -readonly [Key in keyof UpdateUserInput]: UpdateUserInput[Key] } = {}
  if (next.email !== original.email) changes.email = next.email
  if (next.displayName !== original.displayName) changes.displayName = next.displayName
  if (next.role !== original.role) changes.role = next.role
  if (next.cooldownHours !== original.cooldownHours) changes.cooldownHours = next.cooldownHours
  if (next.mustChangePassword !== original.mustChangePassword) {
    changes.mustChangePassword = next.mustChangePassword
  }
  if (form.password !== '') changes.password = form.password
  return changes
}
