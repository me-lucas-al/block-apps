import type { Clock } from '../../domain/time/Clock'
import type { DueChangeApplier } from '../contracts/DueChangeApplier'
import type { PendingChangeStore } from '../contracts/PendingChangeStore'

export class ApplyDueChangesForUserUseCase {
  constructor(
    private readonly pendingChangeStore: PendingChangeStore,
    private readonly dueChangeApplier: DueChangeApplier,
    private readonly clock: Clock,
  ) {}

  async applyDueChangesForUser(userId: string): Promise<number> {
    const dueChanges = await this.pendingChangeStore.listDueByUser(
      userId,
      this.clock().toISOString(),
    )
    let appliedCount = 0
    for (const change of dueChanges) {
      if (await this.dueChangeApplier.applyDueChange(userId, change)) appliedCount += 1
    }
    return appliedCount
  }
}
