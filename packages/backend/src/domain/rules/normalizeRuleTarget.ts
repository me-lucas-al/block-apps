import {
  isProtectionTarget,
  normalizeIosSelectionTarget,
  normalizeKeywordTarget,
  normalizeSiteTarget,
  parseAppIdentifier,
  type TargetType,
} from '@block-apps/core'
import { ValidationError } from '../errors/ValidationError'

export function normalizeRuleTarget(targetType: TargetType, rawTarget: string): string {
  if (targetType === 'site') {
    const hostname = normalizeSiteTarget(rawTarget)
    if (!hostname) throw new ValidationError('target must be a valid domain')
    return hostname
  }
  if (targetType === 'keyword') {
    const keyword = normalizeKeywordTarget(rawTarget)
    if (!keyword) throw new ValidationError('target must be a valid keyword')
    return keyword
  }
  if (targetType === 'iosSelection') {
    const selectionName = normalizeIosSelectionTarget(rawTarget)
    if (!selectionName) throw new ValidationError('target must be a valid app group name')
    return selectionName
  }
  if (targetType === 'protection') {
    const protectionTarget = rawTarget.trim()
    if (!isProtectionTarget(protectionTarget)) throw new ValidationError('target must be a known protection')
    return protectionTarget
  }
  const packageName = parseAppIdentifier(rawTarget)
  if (!packageName) throw new ValidationError('target must be an Android package name')
  return packageName
}
