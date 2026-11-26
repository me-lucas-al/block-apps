import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import { hashDnsToken } from '../../../../dns/token/hashDnsToken'
import { isConditionalCheckFailure } from '../../conditions/isConditionalCheckFailure'
import type { TableContext } from '../../TableContext'
import { dnsSettingsKey } from '../items/dnsKeys'

export async function changeDnsTimeZone(
  context: TableContext,
  userId: string,
  currentDnsSettings: DnsSettings,
  timeZone: string,
): Promise<boolean> {
  try {
    await context.client.send(
      new UpdateCommand({
        TableName: context.tableName,
        Key: dnsSettingsKey(userId),
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
    if (isConditionalCheckFailure(error)) return false
    throw error
  }
}
