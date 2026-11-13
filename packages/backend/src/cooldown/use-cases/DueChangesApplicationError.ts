export class DueChangesApplicationError extends Error {
  constructor(
    readonly failedUserIds: readonly string[],
    readonly appliedCount: number,
  ) {
    super(
      `Failed to apply due changes for ${failedUserIds.length} user(s): ${failedUserIds.join(', ')}`,
    )
    this.name = 'DueChangesApplicationError'
  }
}
