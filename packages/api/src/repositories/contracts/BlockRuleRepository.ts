import type { BlockRule } from '@block-apps/core'

export type NewBlockRule = Omit<BlockRule, 'id'>

export type Unsubscribe = () => void

export interface BlockRuleRepository {
  list(): Promise<BlockRule[]>
  create(rule: NewBlockRule): Promise<BlockRule>
  update(rule: BlockRule): Promise<BlockRule>
  remove(ruleId: string): Promise<void>
  subscribe(onChange: () => void): Unsubscribe
}
