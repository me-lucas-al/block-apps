import {
  GetCommand,
  TransactWriteCommand,
  type TransactWriteCommandInput,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import type { DnsSettings, DnsSettingsStore } from '../../../dns/contracts/DnsSettingsStore'
import { hashDnsToken } from '../../../dns/token/hashDnsToken'
import { readFailedConditionIndexes } from '../conditions/readFailedConditionIndexes'
import { dnsTokenPartitionKey, userPartitionKey } from '../keys/partitionKeys'
import { DNS_SORT_KEY, DNS_TOKEN_SORT_KEY } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'
import { readDnsSettings } from './readDnsSettings'

type TransactItem = NonNullable<TransactWriteCommandInput['TransactItems']>[number]

type UserItemGuard = {
  readonly condition: string
  readonly values?: Record<string, string>
}

export class DynamoDnsSettingsStore implements DnsSettingsStore {
  constructor(private readonly context: TableContext) {}

  async findDnsSettings(userId: string): Promise<DnsSettings | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: DNS_SORT_KEY },
        ConsistentRead: true,
      }),
    )
    return readDnsSettings(Item)
  }

  createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean> {
    return this.runTransaction([
      this.putUserItem(userId, newDnsSettings, { condition: 'attribute_not_exists(pk)' }),
      this.putTokenLookup(userId, newDnsSettings.token),
    ])
  }

  replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean> {
    const currentTokenHash = hashDnsToken(currentDnsSettings.token)
    return this.runTransaction([
      this.putUserItem(userId, rotatedDnsSettings, {
        condition: 'tokenHash = :currentTokenHash',
        values: { ':currentTokenHash': currentTokenHash },
      }),
      this.putTokenLookup(userId, rotatedDnsSettings.token),
      { Delete: { TableName: this.context.tableName, Key: this.tokenLookupKey(currentTokenHash) } },
    ])
  }

  async changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean> {
    try {
      await this.context.client.send(
        new UpdateCommand({
          TableName: this.context.tableName,
          Key: { pk: userPartitionKey(userId), sk: DNS_SORT_KEY },
          UpdateExpression: 'SET #timeZone = :timeZone',
          ExpressionAttributeNames: { '#timeZone': 'timeZone' },
          ConditionExpression: 'tokenHash = :currentTokenHash',
          ExpressionAttributeValues: {
            ':timeZone': timeZone,
            ':currentTokenHash': hashDnsToken(currentDnsSettings.token),
          },
        }),
      )
      return true
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
      throw error
    }
  }

  async findUserIdByDnsTokenHash(tokenHash: string): Promise<string | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({ TableName: this.context.tableName, Key: this.tokenLookupKey(tokenHash) }),
    )
    const userId = Item?.['userId']
    return typeof userId === 'string' ? userId : null
  }

  private tokenLookupKey(tokenHash: string) {
    return { pk: dnsTokenPartitionKey(tokenHash), sk: DNS_TOKEN_SORT_KEY }
  }

  private putTokenLookup(userId: string, token: string): TransactItem {
    const item = { ...this.tokenLookupKey(hashDnsToken(token)), userId }
    return { Put: { TableName: this.context.tableName, Item: item } }
  }

  private putUserItem(userId: string, dnsSettings: DnsSettings, guard: UserItemGuard): TransactItem {
    return {
      Put: {
        TableName: this.context.tableName,
        Item: {
          pk: userPartitionKey(userId),
          sk: DNS_SORT_KEY,
          token: dnsSettings.token,
          tokenHash: hashDnsToken(dnsSettings.token),
          timeZone: dnsSettings.timeZone,
          createdAt: dnsSettings.createdAt,
        },
        ConditionExpression: guard.condition,
        ExpressionAttributeValues: guard.values,
      },
    }
  }

  private async runTransaction(items: TransactItem[]): Promise<boolean> {
    try {
      await this.context.client.send(new TransactWriteCommand({ TransactItems: items }))
      return true
    } catch (error: unknown) {
      if (readFailedConditionIndexes(error)) return false
      throw error
    }
  }
}
