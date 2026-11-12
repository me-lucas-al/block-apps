import { validateSchedule, type BlockMode, type TimeWindow } from '@block-apps/core'
import { ValidationError } from '../errors/ValidationError'

export type RuleChangeContent = {
  readonly mode: BlockMode
  readonly windows: readonly TimeWindow[]
}

export function ensureValidRuleContent(content: RuleChangeContent): RuleChangeContent {
  const windows = content.mode === 'always' ? [] : content.windows
  const scheduleError = validateSchedule(content.mode, windows)
  if (scheduleError) throw new ValidationError(`invalid schedule: ${scheduleError}`)
  return { mode: content.mode, windows }
}
