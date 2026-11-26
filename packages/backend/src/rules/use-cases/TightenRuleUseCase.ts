import type { BlockRule, RuleSchedule } from '@block-apps/core'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'

export class TightenRuleUseCase {
  constructor(private readonly blockRuleStore: BlockRuleStore) {}

  tightenRule(userId: string, readRule: BlockRule, requested: RuleSchedule): Promise<BlockRule> {
    return this.blockRuleStore.updateSchedule(userId, readRule, requested)
  }
}
