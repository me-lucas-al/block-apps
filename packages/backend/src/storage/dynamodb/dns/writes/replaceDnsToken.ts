import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import { hashDnsToken } from '../../../../dns/token/hashDnsToken'
import type { TableContext } from '../../TableContext'
import { dnsTokenLookupKey } from '../items/dnsKeys'
import { commitConditionalWrites } from './commitConditionalWrites'
import { putDnsSettingsWrite } from './putDnsSettingsWrite'
import { putDnsTokenLookupWrite } from './putDnsTokenLookupWrite'

export function replaceDnsToken(
  context: TableContext,
  userId: string,
  currentDnsSettings: DnsSettings,
  rotatedDnsSettings: DnsSettings,
): Promise<boolean> {
  const currentTokenHash = hashDnsToken(currentDnsSettings.token)
  return commitConditionalWrites(context, [
    putDnsSettingsWrite(context, userId, rotatedDnsSettings, {
      condition: 'tokenHash = :currentTokenHash AND #timeZone = :currentTimeZone',
      names: { '#timeZone': 'timeZone' },
      values: {
        ':currentTokenHash': currentTokenHash,
        ':currentTimeZone': currentDnsSettings.timeZone,
      },
    }),
    putDnsTokenLookupWrite(context, userId, rotatedDnsSettings.token),
    { Delete: { TableName: context.tableName, Key: dnsTokenLookupKey(currentTokenHash) } },
  ])
}
