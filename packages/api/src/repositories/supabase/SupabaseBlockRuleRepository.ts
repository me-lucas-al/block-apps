import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BlockRuleRepository,
  NewBlockRule,
  Unsubscribe,
} from '../contracts/BlockRuleRepository'
import { type BlockRuleRow, toBlockRule, toInsertRow } from './blockRuleRow'
import {
  type PendingChangeRow,
  readPendingChange,
  toPendingChange,
} from './pendingChangeRow'
import { assertNoError, unwrap } from './unwrap'

const RULES_TABLE = 'block_rules'
const CHANGES_TABLE = 'rule_change_requests'

export class SupabaseBlockRuleRepository implements BlockRuleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(): Promise<BlockRule[]> {
    const rows = unwrap(
      await this.client.from(RULES_TABLE).select('*').order('created_at'),
    ) as BlockRuleRow[]
    return rows.map(toBlockRule)
  }

  async create(rule: NewBlockRule): Promise<BlockRule> {
    const row = unwrap(
      await this.client.from(RULES_TABLE).insert(toInsertRow(rule)).select().single(),
    ) as BlockRuleRow
    return toBlockRule(row)
  }

  async applyDueChanges(): Promise<void> {
    assertNoError(await this.client.rpc('apply_due_rule_changes'))
  }

  async requestRemoval(ruleId: string): Promise<PendingRuleChange> {
    const result = await this.client.rpc('request_rule_removal', { p_rule_id: ruleId })
    return readPendingChange(unwrap(result) as PendingChangeRow | PendingChangeRow[])
  }

  async listPendingChanges(): Promise<PendingRuleChange[]> {
    const rows = unwrap(
      await this.client.from(CHANGES_TABLE).select('*').order('effective_at'),
    ) as PendingChangeRow[]
    return rows.map(toPendingChange)
  }

  async cancelPendingChange(changeId: string): Promise<void> {
    assertNoError(await this.client.from(CHANGES_TABLE).delete().eq('id', changeId))
  }

  subscribe(onChange: () => void): Unsubscribe {
    const channel = this.client
      .channel(`${RULES_TABLE}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: RULES_TABLE }, onChange)
      .subscribe()
    return () => {
      void this.client.removeChannel(channel)
    }
  }
}
