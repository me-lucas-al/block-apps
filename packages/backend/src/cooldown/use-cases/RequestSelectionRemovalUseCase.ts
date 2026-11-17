import type { PendingRuleChange } from '@block-apps/core'
import type { RuleChangeScheduler } from '../scheduling/RuleChangeScheduler'

export class RequestSelectionRemovalUseCase {
  constructor(private readonly ruleChangeScheduler: RuleChangeScheduler) {}

  requestSelectionRemoval(userId: string, ruleId: string): Promise<PendingRuleChange> {
    return this.ruleChangeScheduler.scheduleChange(userId, ruleId, {
      kind: 'selectionRemoval',
      mode: null,
      windows: null,
    })
  }
}
