import { RuleQuotaExceededError } from '../../domain/errors/RuleQuotaExceededError'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'

export class RuleQuotaGuard {
  constructor(
    private readonly blockRuleStore: BlockRuleStore,
    private readonly maxRulesPerUser: number,
  ) {}

  async ensureRoomForNewRule(userId: string): Promise<void> {
    const currentRules = await this.blockRuleStore.listRulesByUser(userId)
    if (currentRules.length >= this.maxRulesPerUser) {
      throw new RuleQuotaExceededError(this.maxRulesPerUser)
    }
  }
}
