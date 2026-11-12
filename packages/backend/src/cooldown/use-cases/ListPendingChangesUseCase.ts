import type { PendingRuleChange } from '@block-apps/core'
import type { PendingChangeStore } from '../contracts/PendingChangeStore'

export class ListPendingChangesUseCase {
  constructor(private readonly pendingChangeStore: PendingChangeStore) {}

  listPendingChanges(userId: string): Promise<PendingRuleChange[]> {
    return this.pendingChangeStore.listChangesByUser(userId)
  }
}
