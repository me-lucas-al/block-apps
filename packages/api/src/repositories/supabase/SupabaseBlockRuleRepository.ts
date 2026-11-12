import type { BlockRule } from '@block-apps/core'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BlockRuleRepository,
  NewBlockRule,
  Unsubscribe,
} from '../contracts/BlockRuleRepository'
import {
  type BlockRuleRow,
  toBlockRule,
  toInsertRow,
} from './blockRuleRow'
import { assertNoError, unwrap } from './unwrap'

const TABLE = 'block_rules'

export class SupabaseBlockRuleRepository implements BlockRuleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<BlockRule[]> {
    const rows = unwrap(
      await this.client.from(TABLE).select('*').order('created_at'),
    ) as BlockRuleRow[]
    return rows.map(toBlockRule)
  }

  async create(rule: NewBlockRule): Promise<BlockRule> {
    const row = unwrap(
      await this.client.from(TABLE).insert(toInsertRow(rule)).select().single(),
    ) as BlockRuleRow
    return toBlockRule(row)
  }

  async update(rule: BlockRule): Promise<BlockRule> {
    const { id, ...fields } = rule
    const row = unwrap(
      await this.client
        .from(TABLE)
        .update(toInsertRow(fields))
        .eq('id', id)
        .select()
        .single(),
    ) as BlockRuleRow
    return toBlockRule(row)
  }

  async remove(ruleId: string): Promise<void> {
    assertNoError(await this.client.from(TABLE).delete().eq('id', ruleId))
  }

  subscribe(onChange: () => void): Unsubscribe {
    const channel = this.client
      .channel(`${TABLE}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, onChange)
      .subscribe()
    return () => {
      void this.client.removeChannel(channel)
    }
  }
}
