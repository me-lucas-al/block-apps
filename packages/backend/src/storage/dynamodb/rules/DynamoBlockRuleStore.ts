import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { BlockRule } from '@block-apps/core'
import type { SiteRuleReader } from '../../../dns/contracts/SiteRuleReader'
import { ConflictError } from '../../../domain/errors/ConflictError'
import type { BlockRuleStore } from '../../../rules/contracts/BlockRuleStore'
import { isConditionalCheckFailure } from '../conditions/isConditionalCheckFailure'
import { userPartitionKey } from '../keys/partitionKeys'
import { SITE_RULE_SORT_PREFIX } from '../keys/siteRuleSortPrefix'
import { RULE_SORT_PREFIX, ruleSortKey } from '../keys/sortKeys'
import { queryAllPages } from '../queryAllPages'
import type { TableContext } from '../TableContext'
import { toBlockRule, toRuleItem } from './ruleItem'

export class DynamoBlockRuleStore implements BlockRuleStore, SiteRuleReader {
  constructor(private readonly context: TableContext) {}

  async listRulesByUser(userId: string): Promise<BlockRule[]> {
    return this.queryRulesByPrefix(userId, RULE_SORT_PREFIX)
  }

  async listSiteRulesByUser(userId: string): Promise<BlockRule[]> {
    return this.queryRulesByPrefix(userId, SITE_RULE_SORT_PREFIX)
  }

  private async queryRulesByPrefix(userId: string, sortPrefix: string): Promise<BlockRule[]> {
    const items = await queryAllPages(this.context, {
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: { ':pk': userPartitionKey(userId), ':prefix': sortPrefix },
    })
    return items.map(toBlockRule)
  }

  async findById(userId: string, ruleId: string): Promise<BlockRule | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: ruleSortKey(ruleId) },
      }),
    )
    return Item ? toBlockRule(Item) : null
  }

  async insert(userId: string, rule: BlockRule): Promise<void> {
    try {
      await this.context.client.send(
        new PutCommand({
          TableName: this.context.tableName,
          Item: toRuleItem(userId, rule),
          ConditionExpression: 'attribute_not_exists(pk)',
        }),
      )
    } catch (error: unknown) {
      if (isConditionalCheckFailure(error)) throw new ConflictError('rule already exists')
      throw error
    }
  }
}
