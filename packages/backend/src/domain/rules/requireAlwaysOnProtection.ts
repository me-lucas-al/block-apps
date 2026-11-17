import type { BlockMode, TargetType } from '@block-apps/core'
import { ValidationError } from '../errors/ValidationError'

export function requireAlwaysOnProtection(targetType: TargetType, mode: BlockMode | null): void {
  if (targetType !== 'protection' || mode === 'always') return
  throw new ValidationError('protection rules must always be on')
}
