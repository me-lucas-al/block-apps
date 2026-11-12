import type { UserType } from '@aws-sdk/client-cognito-identity-provider'

function isNativeUsername(username: string): boolean {
  return !username.includes('_')
}

function hasVerifiedEmail(user: UserType): boolean {
  const attributes = user.Attributes ?? []
  return attributes.some(
    (attribute) => attribute.Name === 'email_verified' && attribute.Value === 'true',
  )
}

function canReceiveFederatedLink(user: UserType): boolean {
  if (!user.Username || !isNativeUsername(user.Username)) return false
  if (user.UserStatus !== 'CONFIRMED') return false
  if (user.Enabled === false) return false
  return hasVerifiedEmail(user)
}

export function findLinkableNativeUser(users: readonly UserType[]): { username: string } | null {
  const linkableUser = users.find(canReceiveFederatedLink)
  return linkableUser?.Username ? { username: linkableUser.Username } : null
}

export function buildEmailFilter(email: string): string {
  const escapedEmail = email.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  return `email = "${escapedEmail}"`
}
