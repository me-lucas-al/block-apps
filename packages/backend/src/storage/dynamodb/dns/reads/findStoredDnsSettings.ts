import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import type { TableContext } from '../../TableContext'
import { dnsSettingsKey } from '../items/dnsKeys'
import { readDnsSettings } from '../items/readDnsSettings'

export async function findStoredDnsSettings(
  context: TableContext,
  userId: string,
): Promise<DnsSettings | null> {
  const response = await context.client.send(
    new GetCommand({
      TableName: context.tableName,
      Key: dnsSettingsKey(userId),
      ConsistentRead: true,
    }),
  )
  return readDnsSettings(userId, response.Item)
}
