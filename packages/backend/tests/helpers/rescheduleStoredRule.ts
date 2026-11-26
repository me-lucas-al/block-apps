import type { BlockRule, RuleSchedule } from '@block-apps/core'
import { ConflictError } from '../../src/domain/errors/ConflictError'
import { NotFoundError } from '../../src/domain/errors/NotFoundError'

export function rescheduleStoredRule(
  storedRule: BlockRule | undefined,
  readRule: BlockRule,
  requested: RuleSchedule,
): BlockRule {
  if (!storedRule) throw new NotFoundError('rule not found')
  const isSameSchedule =
    storedRule.mode === readRule.mode &&
    JSON.stringify(storedRule.windows) === JSON.stringify(readRule.windows)
  if (!isSameSchedule) throw new ConflictError('rule schedule changed meanwhile; try again')
  return { ...storedRule, mode: requested.mode, windows: requested.windows }
}
