export const DEV_ADMIN_ID = '00000000-0000-4000-8000-0000000000a1'
export const DEV_USER_ID = '00000000-0000-4000-8000-0000000000b1'

export function buildDevToken(userId: string, groups: readonly string[]): string {
  return `dev:${userId}:${groups.join(',')}`
}
