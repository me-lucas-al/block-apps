import type { PendingRuleChange } from '@block-apps/core'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireSupabaseData } from '../../../supabase/requireSupabaseData'
import { throwIfSupabaseError } from '../../../supabase/throwIfSupabaseError'
import type { PendingRuleChangeRepository } from '../../contracts/PendingRuleChangeRepository'
import { type PendingChangeRow, toPendingChange } from './pendingChangeRow'
import { readReturnedPendingChange } from './readReturnedPendingChange'

const CHANGES_TABLE = 'rule_change_requests'

export class SupabasePendingRuleChangeRepository implements PendingRuleChangeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async applyDueChanges(): Promise<void> {
    throwIfSupabaseError(await this.client.rpc('apply_due_rule_changes'))
  }

  async requestRemoval(ruleId: string): Promise<PendingRuleChange> {
    const removalResponse = await this.client.rpc('request_rule_removal', { p_rule_id: ruleId })
    return readReturnedPendingChange(
      requireSupabaseData(removalResponse) as PendingChangeRow | PendingChangeRow[],
    )
  }

  async listPendingChanges(): Promise<PendingRuleChange[]> {
    const changeRows = requireSupabaseData(
      await this.client.from(CHANGES_TABLE).select('*').order('effective_at'),
    ) as PendingChangeRow[]
    return changeRows.map(toPendingChange)
  }

  async cancelPendingChange(changeId: string): Promise<void> {
    throwIfSupabaseError(await this.client.from(CHANGES_TABLE).delete().eq('id', changeId))
  }
}
