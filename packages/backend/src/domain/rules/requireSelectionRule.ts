import type { TargetType } from '@block-apps/core'
import { ValidationError } from '../errors/ValidationError'

export function requireSelectionRule(targetType: TargetType): void {
  if (targetType === 'iosSelection') return
  throw new ValidationError('only app group selections accept a selection removal')
}
