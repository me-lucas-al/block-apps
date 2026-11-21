import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import type { TableContext } from '../../TableContext'
import { commitConditionalWrites } from './commitConditionalWrites'
import { putDnsSettingsWrite } from './putDnsSettingsWrite'
import { putDnsTokenLookupWrite } from './putDnsTokenLookupWrite'

export function createDnsSettings(
  context: TableContext,
  userId: string,
  newDnsSettings: DnsSettings,
): Promise<boolean> {
  return commitConditionalWrites(context, [
    putDnsSettingsWrite(context, userId, newDnsSettings, {
      condition: 'attribute_not_exists(pk)',
    }),
    putDnsTokenLookupWrite(context, userId, newDnsSettings.token),
  ])
}
