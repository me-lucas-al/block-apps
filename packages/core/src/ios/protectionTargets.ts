export const IOS_DENY_APP_REMOVAL_TARGET = 'ios-deny-app-removal'

export const PROTECTION_TARGETS: readonly string[] = [IOS_DENY_APP_REMOVAL_TARGET]

export function isProtectionTarget(target: string): boolean {
  return PROTECTION_TARGETS.includes(target)
}
