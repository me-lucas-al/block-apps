const USER_PREFIX = 'USER#'

export const DUE_CHANGES_BUCKET = 'DUE'
export const DUE_CHANGES_INDEX_NAME = 'due-changes'

export function userPartitionKey(userId: string): string {
  return `${USER_PREFIX}${userId}`
}

export function readUserIdFromPartitionKey(partitionKey: string): string {
  return partitionKey.slice(USER_PREFIX.length)
}
