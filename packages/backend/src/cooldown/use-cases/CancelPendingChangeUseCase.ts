import type { PendingChangeStore } from '../contracts/PendingChangeStore'

export class CancelPendingChangeUseCase {
  constructor(private readonly pendingChangeStore: PendingChangeStore) {}

  cancelPendingChange(userId: string, ruleId: string): Promise<void> {
    return this.pendingChangeStore.cancel(userId, ruleId)
  }
}
