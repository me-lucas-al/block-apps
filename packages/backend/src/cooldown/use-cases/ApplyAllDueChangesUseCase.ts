import { DueChangesApplicationError } from '../../domain/errors/DueChangesApplicationError'
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
    const failedUserIds: string[] = []
    let appliedCount = 0
    for (const userId of userIds) {
      try {
        appliedCount += await this.applyDueChangesForUser.applyDueChangesForUser(userId)
      } catch (error: unknown) {
        console.error(`Failed to apply due changes for user ${userId}:`, error)
        failedUserIds.push(userId)
      }
    }
    if (failedUserIds.length > 0) {
      throw new DueChangesApplicationError(failedUserIds, appliedCount)
    }
    return appliedCount
  }
}
