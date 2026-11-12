import type { BlockRule, TimeWindow } from '@block-apps/core'
import type { NewBlockRule } from '../contracts/BlockRuleRepository'

export type BlockRuleRow = {
  id: string
  target_type: BlockRule['targetType']
  target: string
  mode: BlockRule['mode']
  windows: TimeWindow[]
}

export type BlockRuleInsertRow = Omit<BlockRuleRow, 'id'>

export function toBlockRule(row: BlockRuleRow): BlockRule {
  return {
    id: row.id,
    targetType: row.target_type,
    target: row.target,
    mode: row.mode,
    windows: row.windows,
  }
}

export function toInsertRow(rule: NewBlockRule): BlockRuleInsertRow {
  return {
    target_type: rule.targetType,
    target: rule.target,
    mode: rule.mode,
    windows: [...rule.windows],
  }
}
