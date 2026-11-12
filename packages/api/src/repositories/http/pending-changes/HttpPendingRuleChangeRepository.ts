import type { PendingRuleChange } from '@block-apps/core'
import type { PendingRuleChangeRepository } from '../../contracts/PendingRuleChangeRepository'
import type { HttpApiClient } from '../../../http/client/HttpApiClient'

export class HttpPendingRuleChangeRepository implements PendingRuleChangeRepository {
  constructor(private readonly http: HttpApiClient) {}

  async applyDueChanges(): Promise<void> {
    await this.http.post<{ appliedCount: number }>('/pending-changes/apply-due')
  }

  async requestRemoval(ruleId: string): Promise<PendingRuleChange> {
    return this.http.post<PendingRuleChange>(
      `/rules/${encodeURIComponent(ruleId)}/removal-requests`,
    )
  }

  async listPendingChanges(): Promise<PendingRuleChange[]> {
    return this.http.get<PendingRuleChange[]>('/pending-changes')
  }

  async cancelPendingChange(ruleId: string): Promise<void> {
    await this.http.delete<void>(`/pending-changes/${encodeURIComponent(ruleId)}`)
  }
}
