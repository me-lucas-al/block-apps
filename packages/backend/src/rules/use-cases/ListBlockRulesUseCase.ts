import type { BlockRule } from '@block-apps/core'
import type { BlockRuleStore } from '../contracts/BlockRuleStore'

export class ListBlockRulesUseCase {
  constructor(private readonly blockRuleStore: BlockRuleStore) {}

  listBlockRules(userId: string): Promise<BlockRule[]> {
    return this.blockRuleStore.listRulesByUser(userId)
  }
}
