import type { BlockRule } from '../../rules/types'
import { isWithinWindow } from './isWithinWindow'

export function isBlockedNow(rule: BlockRule, now: Date): boolean {
  if (rule.mode === 'always') return true
  return !rule.windows.some((window) => isWithinWindow(window, now))
}
