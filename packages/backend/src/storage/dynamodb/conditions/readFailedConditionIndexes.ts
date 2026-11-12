import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'

export function readFailedConditionIndexes(error: unknown): number[] | null {
  if (!(error instanceof TransactionCanceledException)) return null
  const reasons = error.CancellationReasons ?? []
  const onlyConditionFailures = reasons.every(
    (reason) => reason.Code === 'None' || reason.Code === 'ConditionalCheckFailed',
  )
  if (!onlyConditionFailures) return null
  const failedIndexes = reasons.flatMap((reason, index) =>
    reason.Code === 'ConditionalCheckFailed' ? [index] : [],
  )
  return failedIndexes.length > 0 ? failedIndexes : null
}
