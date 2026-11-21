import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { UserDataEraser } from '../../../users/contracts/UserDataEraser'
import { DNS_LOOKUP_ATTRIBUTES } from '../dns/listDnsLookupKeys'
import { userPartitionKey } from '../keys/partitionKeys'
import { queryAllPages } from '../queryAllPages'
import type { TableContext } from '../TableContext'
import { planUserErasure } from './planUserErasure'

const BATCH_SIZE = 25
const PROJECTED_ATTRIBUTES = ['pk', 'sk', ...DNS_LOOKUP_ATTRIBUTES]

export class DynamoUserDataEraser implements UserDataEraser {
  constructor(private readonly context: TableContext) {}

  async eraseAllDataOf(userId: string): Promise<void> {
    const storedEntries = await queryAllPages(this.context, {
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: { ':pk': userPartitionKey(userId) },
      ProjectionExpression: PROJECTED_ATTRIBUTES.join(', '),
      ConsistentRead: true,
    })
    const { lookupKeys, userKeys } = planUserErasure(storedEntries)
    await this.deleteInBatches(lookupKeys)
    await this.deleteInBatches(userKeys)
  }

  private async deleteInBatches(keys: Record<string, unknown>[]): Promise<void> {
    for (let start = 0; start < keys.length; start += BATCH_SIZE) {
      await this.deleteBatch(keys.slice(start, start + BATCH_SIZE))
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
