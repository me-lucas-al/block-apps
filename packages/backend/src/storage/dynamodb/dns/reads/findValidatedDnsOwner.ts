import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { ValidatedDnsOwner } from '../../../../dns/contracts/DnsTokenLookup'
import { hashDnsToken } from '../../../../dns/token/hashDnsToken'
import type { TableContext } from '../../TableContext'
import { dnsTokenLookupKey } from '../items/dnsKeys'
import { findStoredDnsSettings } from './findStoredDnsSettings'

export async function findValidatedDnsOwner(
  context: TableContext,
  tokenHash: string,
): Promise<ValidatedDnsOwner | null> {
  const lookupResponse = await context.client.send(
    new GetCommand({
      TableName: context.tableName,
      Key: dnsTokenLookupKey(tokenHash),
      ConsistentRead: true,
    }),
  )
  const userId = lookupResponse.Item?.['userId']
  if (typeof userId !== 'string') return null
  const dnsSettings = await findStoredDnsSettings(context, userId)
  if (!dnsSettings) return null
  if (hashDnsToken(dnsSettings.token) !== tokenHash) return null
  return { userId, dnsSettings }
}
