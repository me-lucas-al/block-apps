import { buildRuleId, type BlockRule, type TargetType } from '@block-apps/core'
import { ensureValidRuleContent, type RuleChangeContent } from '../../domain/rules/ensureValidRuleContent'
import { normalizeRuleTarget } from '../../domain/rules/normalizeRuleTarget'
import { requireAlwaysOnProtection } from '../../domain/rules/requireAlwaysOnProtection'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'
import type { RuleQuotaGuard } from '../quota/RuleQuotaGuard'

export type NewBlockRuleInput = RuleChangeContent & {
  readonly targetType: TargetType
  readonly target: string
}

export class CreateBlockRuleUseCase {
  constructor(
    private readonly blockRuleStore: BlockRuleStore,
    private readonly ruleQuotaGuard: RuleQuotaGuard,
  ) {}

  async createBlockRule(userId: string, input: NewBlockRuleInput): Promise<BlockRule> {
    const target = normalizeRuleTarget(input.targetType, input.target)
    const { mode, windows } = ensureValidRuleContent(input)
    requireAlwaysOnProtection(input.targetType, mode)
    const rule: BlockRule = {
      id: buildRuleId(input.targetType, target),
      targetType: input.targetType,
      target,
      mode,
      windows,
    }
    await this.ruleQuotaGuard.ensureRoomForNewRule(userId)
    await this.blockRuleStore.insert(userId, rule)
    return rule
  }
}
