import type { PendingRuleChange } from '@block-apps/core'
import type { RuleChangeScheduler } from '../scheduling/RuleChangeScheduler'

export class RequestRuleRemovalUseCase {
  constructor(private readonly ruleChangeScheduler: RuleChangeScheduler) {}

  requestRuleRemoval(userId: string, ruleId: string): Promise<PendingRuleChange> {
    return this.ruleChangeScheduler.scheduleChange(userId, ruleId, {
      kind: 'delete',
      mode: null,
      windows: null,
    })
  }
}
