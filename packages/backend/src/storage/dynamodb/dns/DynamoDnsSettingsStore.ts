import { GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import type { DnsSettings, DnsSettingsStore } from '../../../dns/contracts/DnsSettingsStore'
import { hashDnsToken } from '../../../dns/token/hashDnsToken'
import { dnsTokenPartitionKey, userPartitionKey } from '../keys/partitionKeys'
import { DNS_SORT_KEY, DNS_TOKEN_SORT_KEY } from '../keys/sortKeys'
import type { TableContext } from '../TableContext'
import { readDnsSettings } from './readDnsSettings'

export class DynamoDnsSettingsStore implements DnsSettingsStore {
  constructor(private readonly context: TableContext) {}

  async findDnsSettings(userId: string): Promise<DnsSettings | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: userPartitionKey(userId), sk: DNS_SORT_KEY },
      }),
    )
    return readDnsSettings(Item)
  }

  async saveDnsSettings(userId: string, settings: DnsSettings, previousTokenHash: string | null): Promise<void> {
    const tokenHash = hashDnsToken(settings.token)
    const tableName = this.context.tableName
    const items: object[] = [
      { Put: { TableName: tableName, Item: this.userItem(userId, settings, tokenHash) } },
      {
        Put: {
          TableName: tableName,
          Item: { pk: dnsTokenPartitionKey(tokenHash), sk: DNS_TOKEN_SORT_KEY, userId },
        },
      },
    ]
    if (previousTokenHash && previousTokenHash !== tokenHash) {
      const key = { pk: dnsTokenPartitionKey(previousTokenHash), sk: DNS_TOKEN_SORT_KEY }
      items.push({ Delete: { TableName: tableName, Key: key } })
    }
    await this.context.client.send(new TransactWriteCommand({ TransactItems: items }))
  }

  async findUserIdByDnsTokenHash(tokenHash: string): Promise<string | null> {
    const { Item } = await this.context.client.send(
      new GetCommand({
        TableName: this.context.tableName,
        Key: { pk: dnsTokenPartitionKey(tokenHash), sk: DNS_TOKEN_SORT_KEY },
      }),
    )
    const userId = Item?.['userId']
    return typeof userId === 'string' ? userId : null
  }

  private userItem(userId: string, settings: DnsSettings, tokenHash: string) {
    return {
      pk: userPartitionKey(userId),
      sk: DNS_SORT_KEY,
      token: settings.token,
      tokenHash,
      timeZone: settings.timeZone,
      createdAt: settings.createdAt,
    }
  }
}
