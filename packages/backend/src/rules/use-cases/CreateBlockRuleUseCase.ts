import type { BlockRule, TargetType } from '@block-apps/core'
import { buildRuleId } from '../../domain/rules/buildRuleId'
import { ensureValidRuleContent, type RuleChangeContent } from '../../domain/rules/ensureValidRuleContent'
import { normalizeRuleTarget } from '../../domain/rules/normalizeRuleTarget'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'

export type NewBlockRuleInput = RuleChangeContent & {
  readonly targetType: TargetType
  readonly target: string
}

export class CreateBlockRuleUseCase {
  constructor(private readonly blockRuleStore: BlockRuleStore) {}

  async createBlockRule(userId: string, input: NewBlockRuleInput): Promise<BlockRule> {
    const target = normalizeRuleTarget(input.target)
    const { mode, windows } = ensureValidRuleContent(input)
    const rule: BlockRule = {
      id: buildRuleId(input.targetType, target),
      targetType: input.targetType,
      target,
      mode,
      windows,
    }
    await this.blockRuleStore.insert(userId, rule)
    return rule
  }
}
