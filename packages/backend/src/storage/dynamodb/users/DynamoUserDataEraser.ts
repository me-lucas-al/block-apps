import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { UserDataEraser } from '../../../users/contracts/UserDataEraser'
import { userPartitionKey } from '../keys/partitionKeys'
import { queryAllPages } from '../queryAllPages'
import type { TableContext } from '../TableContext'

const BATCH_SIZE = 25

export class DynamoUserDataEraser implements UserDataEraser {
  constructor(private readonly context: TableContext) {}

  async eraseAllDataOf(userId: string): Promise<void> {
    const items = await queryAllPages(this.context, {
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': userPartitionKey(userId) },
      ProjectionExpression: 'pk, sk',
      ConsistentRead: true,
    })
    for (let start = 0; start < items.length; start += BATCH_SIZE) {
      await this.deleteBatch(items.slice(start, start + BATCH_SIZE))
    }
  }

  private async deleteBatch(keys: Record<string, unknown>[]): Promise<void> {
    let pending = keys.map((key) => ({ DeleteRequest: { Key: key } }))
    for (let attempt = 0; attempt < 5 && pending.length > 0; attempt += 1) {
      const { UnprocessedItems } = await this.context.client.send(
        new BatchWriteCommand({ RequestItems: { [this.context.tableName]: pending } }),
      )
      pending = (UnprocessedItems?.[this.context.tableName] ?? []).flatMap((request) =>
        request.DeleteRequest?.Key ? [{ DeleteRequest: { Key: request.DeleteRequest.Key } }] : [],
      )
    }
    if (pending.length > 0) throw new Error('could not erase all user data')
  }
}
