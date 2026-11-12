import type { DirectoryUser } from './DirectoryUser'

export function isUsableAdmin(user: DirectoryUser): boolean {
  return user.role === 'admin' && user.enabled && !user.mustChangePassword
}
