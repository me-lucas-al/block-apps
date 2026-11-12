import type { BlockRule } from '@block-apps/core'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabaseData } from '../../../supabase/requireSupabaseData'
import type { Unsubscribe } from '../../../subscription/Unsubscribe'
import type { BlockRuleRepository, NewBlockRule } from '../../contracts/BlockRuleRepository'
import { type BlockRuleRow, toBlockRule, toBlockRuleInsertRow } from './blockRuleRow'

const RULES_TABLE = 'block_rules'

export class SupabaseBlockRuleRepository implements BlockRuleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<BlockRule[]> {
    const ruleRows = requireSupabaseData(
      await this.client.from(RULES_TABLE).select('*').order('created_at'),
    ) as BlockRuleRow[]
    return ruleRows.map(toBlockRule)
  }

  async create(newRule: NewBlockRule): Promise<BlockRule> {
    const createdRow = requireSupabaseData(
      await this.client.from(RULES_TABLE).insert(toBlockRuleInsertRow(newRule)).select().single(),
    ) as BlockRuleRow
    return toBlockRule(createdRow)
  }

  subscribeToRuleChanges(onRuleChanged: () => void): Unsubscribe {
    const channel = this.client
      .channel(`${RULES_TABLE}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: RULES_TABLE }, onRuleChanged)
      .subscribe()
    return () => {
      void this.client.removeChannel(channel)
    }
  }
}
