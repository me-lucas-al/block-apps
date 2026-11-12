import type { BlockRule } from '@block-apps/core'
import type { Unsubscribe } from '../../subscription/Unsubscribe'

export type NewBlockRule = Omit<BlockRule, 'id'>

export interface BlockRuleRepository {
  list(): Promise<BlockRule[]>
  create(newRule: NewBlockRule): Promise<BlockRule>
  subscribeToRuleChanges(onRuleChanged: () => void): Unsubscribe
}
