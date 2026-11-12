import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb'

export function isConditionalCheckFailure(error: unknown): boolean {
  return error instanceof ConditionalCheckFailedException
}
