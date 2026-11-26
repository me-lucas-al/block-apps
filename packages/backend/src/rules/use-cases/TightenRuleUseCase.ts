import { isTighteningChange, type BlockRule, type RuleSchedule } from '@block-apps/core'
import { ValidationError } from '../../domain/errors/ValidationError'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'

export class TightenRuleUseCase {
  constructor(private readonly blockRuleStore: BlockRuleStore) {}

  tightenRule(userId: string, readRule: BlockRule, requested: RuleSchedule): Promise<BlockRule> {
    if (!isTighteningChange(readRule, requested)) {
      throw new ValidationError('only a change that tightens the block can skip the cooldown')
    }
    return this.blockRuleStore.updateSchedule(userId, readRule, requested)
  }
}
