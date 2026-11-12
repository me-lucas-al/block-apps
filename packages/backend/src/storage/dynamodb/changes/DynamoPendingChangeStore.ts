import { DeleteCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { PendingRuleChange } from '@block-apps/core'
import type { PendingChangeStore } from '../../../cooldown/contracts/PendingChangeStore'
import {
  DUE_CHANGES_BUCKET,
  DUE_CHANGES_INDEX_NAME,
  readUserIdFromPartitionKey,
  userPartitionKey,
} from '../keys/partitionKeys'
import { CHANGE_SORT_PREFIX, changeSortKey } from '../keys/sortKeys'
import { queryAllPages } from '../queryAllPages'
import type { TableContext } from '../TableContext'
import { toChangeItem, toPendingChange } from './changeItem'

export class DynamoPendingChangeStore implements PendingChangeStore {
  constructor(private readonly context: TableContext) {}

  async listChangesByUser(userId: string): Promise<PendingRuleChange[]> {
    const items = await queryAllPages(this.context, {
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: {
        ':pk': userPartitionKey(userId),
        ':prefix': CHANGE_SORT_PREFIX,
      },
    })
    return items.map(toPendingChange)
  }

  async findByRuleId(userId: string, ruleId: string): Promise<PendingRuleChange | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: changeSortKey(ruleId) },
      }),
    )
    return Item ? toPendingChange(Item) : null
  }

  async save(userId: string, change: PendingRuleChange): Promise<void> {
    await this.context.client.send(
      new PutCommand({ TableName: this.context.tableName, Item: toChangeItem(userId, change) }),
    )
  }

  async cancel(userId: string, ruleId: string): Promise<void> {
    await this.context.client.send(
      new DeleteCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: changeSortKey(ruleId) },
      }),
    )
  }

  async listDueByUser(userId: string, nowIso: string): Promise<PendingRuleChange[]> {
    const items = await queryAllPages(this.context, {
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      FilterExpression: 'effectiveAt <= :now',
      ExpressionAttributeValues: {
        ':pk': userPartitionKey(userId),
        ':prefix': CHANGE_SORT_PREFIX,
        ':now': nowIso,
      },
    })
    return items
      .map(toPendingChange)
      .sort((first, second) => first.effectiveAt.localeCompare(second.effectiveAt))
  }

  async listUserIdsWithDueChanges(nowIso: string): Promise<string[]> {
    const items = await queryAllPages(this.context, {
      IndexName: DUE_CHANGES_INDEX_NAME,
      KeyConditionExpression: 'dueBucket = :bucket AND effectiveAt <= :now',
      ExpressionAttributeValues: { ':bucket': DUE_CHANGES_BUCKET, ':now': nowIso },
    })
    const partitionKeys = items.map((item) => String(item['pk']))
    return [...new Set(partitionKeys)].map(readUserIdFromPartitionKey)
  }
}
