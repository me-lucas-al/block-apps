const LISTED_USER_IDS_LIMIT = 5

export class DueChangesApplicationError extends Error {
  constructor(
    readonly failedUserIds: readonly string[],
    readonly appliedCount: number,
  ) {
    super(buildMessage(failedUserIds))
    this.name = 'DueChangesApplicationError'
  }
}

function buildMessage(failedUserIds: readonly string[]): string {
  const listedUserIds = failedUserIds.slice(0, LISTED_USER_IDS_LIMIT).join(', ')
  const omittedCount = failedUserIds.length - LISTED_USER_IDS_LIMIT
  const omittedNote = omittedCount > 0 ? ` and ${omittedCount} more` : ''
  return `Failed to apply due changes for ${failedUserIds.length} user(s): ${listedUserIds}${omittedNote}`
}
