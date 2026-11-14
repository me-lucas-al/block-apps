export const TARGET_TYPES = ['app', 'site', 'keyword', 'iosSelection', 'protection'] as const

export type TargetType = (typeof TARGET_TYPES)[number]

export function isTargetType(candidate: unknown): candidate is TargetType {
  return TARGET_TYPES.some((targetType) => targetType === candidate)
}
