const CONDITION_FAILURE_NAMES = new Set([
  'ConditionalCheckFailedException',
  'TransactionCanceledException',
])

export function isConditionFailure(error: unknown): boolean {
  return error instanceof Error && CONDITION_FAILURE_NAMES.has(error.name)
}
