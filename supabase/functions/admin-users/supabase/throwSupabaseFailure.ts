import { AdminError } from '../../_shared/admin-users/AdminError.ts'

type SupabaseFailure = { message: string; code?: string }

export function throwSupabaseFailure(action: string, failure: SupabaseFailure): never {
  if (failure.code === 'email_exists') throw new AdminError('conflict', 'email already registered')
  if (failure.message.includes('last admin')) {
    throw new AdminError('last_admin', 'at least one admin must remain')
  }
  throw new Error(`${action}: ${failure.message}`)
}
