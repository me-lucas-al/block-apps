import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { readFailedConditionIndexes } from '../../conditions/readFailedConditionIndexes'
import type { TableContext } from '../../TableContext'
import type { ConditionalWrite } from './ConditionalWrite'

export async function commitConditionalWrites(
  context: TableContext,
  writes: ConditionalWrite[],
): Promise<boolean> {
  try {
    await context.client.send(new TransactWriteCommand({ TransactItems: writes }))
    return true
  } catch (error: unknown) {
    if (readFailedConditionIndexes(error)) return false
    throw error
  }
}
