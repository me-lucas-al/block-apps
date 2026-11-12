import type { BlockRule } from '@block-apps/core'

export interface BlockRuleStore {
  listRulesByUser(userId: string): Promise<BlockRule[]>
  findById(userId: string, ruleId: string): Promise<BlockRule | null>
  insert(userId: string, rule: BlockRule): Promise<void>
}
