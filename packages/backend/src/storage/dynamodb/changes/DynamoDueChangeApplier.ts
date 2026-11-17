import { TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { PendingRuleChange } from '@block-apps/core'
import type { DueChangeApplier } from '../../../cooldown/contracts/DueChangeApplier'
import { readFailedConditionIndexes } from '../conditions/readFailedConditionIndexes'
import { userPartitionKey } from '../keys/partitionKeys'
import { changeSortKey, ruleSortKey } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'

export class DynamoDueChangeApplier implements DueChangeApplier {
  constructor(private readonly context: TableContext) {}

  private buildChangeOnRule(change: PendingRuleChange, ruleKey: { pk: string; sk: string }) {
    const base = { TableName: this.context.tableName, Key: ruleKey, ConditionExpression: 'attribute_exists(pk)' }
    if (change.kind === 'delete') return { Delete: base }
    if (change.kind === 'selectionRemoval') return { ConditionCheck: base }
    return {
      Update: {
        ...base,
        UpdateExpression: 'SET #mode = :mode, #windows = :windows',
        ExpressionAttributeNames: { '#mode': 'mode', '#windows': 'windows' },
        ExpressionAttributeValues: { ':mode': change.mode, ':windows': change.windows },
      },
    }
  }

  async applyDueChange(userId: string, change: PendingRuleChange): Promise<boolean> {
    const partitionKey = userPartitionKey(userId)
    const ruleKey = { pk: partitionKey, sk: ruleSortKey(change.ruleId) }
    const removePendingChange = {
      Delete: {
        TableName: this.context.tableName,
        Key: { pk: partitionKey, sk: changeSortKey(change.ruleId) },
        ConditionExpression: 'effectiveAt = :effectiveAt',
        ExpressionAttributeValues: { ':effectiveAt': change.effectiveAt },
      },
    }
    const changeOnRule = this.buildChangeOnRule(change, ruleKey)
    try {
      await this.context.client.send(
        new TransactWriteCommand({ TransactItems: [changeOnRule, removePendingChange] }),
      )
      return true
    } catch (error: unknown) {
      if (readFailedConditionIndexes(error)) return false
      throw error
    }
  }
}
