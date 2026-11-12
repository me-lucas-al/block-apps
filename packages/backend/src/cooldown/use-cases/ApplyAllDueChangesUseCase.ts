import type { Clock } from '../../domain/time/Clock'
import type { PendingChangeStore } from '../contracts/PendingChangeStore'
import type { ApplyDueChangesForUserUseCase } from './ApplyDueChangesForUserUseCase'

export class ApplyAllDueChangesUseCase {
  constructor(
    private readonly pendingChangeStore: PendingChangeStore,
    private readonly applyDueChangesForUser: ApplyDueChangesForUserUseCase,
    private readonly clock: Clock,
  ) {}

  async applyAllDueChanges(): Promise<number> {
    const userIds = await this.pendingChangeStore.listUserIdsWithDueChanges(
      this.clock().toISOString(),
    )
    let appliedCount = 0
    for (const userId of userIds) {
      appliedCount += await this.applyDueChangesForUser.applyDueChangesForUser(userId)
    }
    return appliedCount
  }
}
