import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import { hashDnsToken } from '../../../../dns/token/hashDnsToken'
import type { TableContext } from '../../TableContext'
import { dnsSettingsKey } from '../items/dnsKeys'
import type { ConditionalWrite } from './ConditionalWrite'

export type DnsSettingsGuard = {
  readonly condition: string
  readonly names?: Record<string, string>
  readonly values?: Record<string, string>
}

export function putDnsSettingsWrite(
  context: TableContext,
  userId: string,
  dnsSettings: DnsSettings,
  guard: DnsSettingsGuard,
): ConditionalWrite {
  return {
    Put: {
      TableName: context.tableName,
      Item: {
        ...dnsSettingsKey(userId),
        token: dnsSettings.token,
        tokenHash: hashDnsToken(dnsSettings.token),
        timeZone: dnsSettings.timeZone,
        createdAt: dnsSettings.createdAt,
        tokenCreatedAt: dnsSettings.tokenCreatedAt,
      },
      ConditionExpression: guard.condition,
      ExpressionAttributeNames: guard.names,
      ExpressionAttributeValues: guard.values,
    },
  }
}
