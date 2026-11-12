import type { PendingRuleChange } from '@block-apps/core'
import {
  ensureValidRuleContent,
  type RuleChangeContent,
} from '../../domain/rules/ensureValidRuleContent'
import type { RuleChangeScheduler } from '../scheduling/RuleChangeScheduler'

export class RequestRuleUpdateUseCase {
  constructor(private readonly ruleChangeScheduler: RuleChangeScheduler) {}

  requestRuleUpdate(
    userId: string,
    ruleId: string,
    content: RuleChangeContent,
  ): Promise<PendingRuleChange> {
    const { mode, windows } = ensureValidRuleContent(content)
    return this.ruleChangeScheduler.scheduleChange(userId, ruleId, {
      kind: 'update',
      mode,
      windows,
    })
  }
}
