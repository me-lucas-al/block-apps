import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { Unsubscribe } from '../../subscription/Unsubscribe'

export type NewBlockRule = Omit<BlockRule, 'id'>
export type RuleUpdateInput = Pick<BlockRule, 'mode' | 'windows'>

export interface BlockRuleRepository {
  list(): Promise<BlockRule[]>
  create(newRule: NewBlockRule): Promise<BlockRule>
  requestUpdate(ruleId: string, update: RuleUpdateInput): Promise<PendingRuleChange>
  subscribeToRuleChanges(onRuleChanged: () => void): Unsubscribe
}
