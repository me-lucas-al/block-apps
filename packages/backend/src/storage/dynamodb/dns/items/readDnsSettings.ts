import type { DnsSettings } from '../../../dns/contracts/DnsSettingsStore'

export function readDnsSettings(item: Record<string, unknown> | undefined): DnsSettings | null {
  const token = item?.['token']
  const timeZone = item?.['timeZone']
  const createdAt = item?.['createdAt']
  if (typeof token !== 'string' || typeof timeZone !== 'string' || typeof createdAt !== 'string') {
    return null
  }
  return { token, timeZone, createdAt }
}
