import type { BlockRule, RuleSchedule } from '@block-apps/core'

export interface BlockRuleStore {
  listRulesByUser(userId: string): Promise<BlockRule[]>
  findById(userId: string, ruleId: string): Promise<BlockRule | null>
  insert(userId: string, rule: BlockRule): Promise<void>
  updateSchedule(userId: string, readRule: BlockRule, requested: RuleSchedule): Promise<BlockRule>
}
