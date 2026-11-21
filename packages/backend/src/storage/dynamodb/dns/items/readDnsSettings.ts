import type { DnsSettings } from '../../../../dns/contracts/DnsSettings'
import { MalformedDnsSettingsError } from '../../../../dns/errors/MalformedDnsSettingsError'
import { hashDnsToken } from '../../../../dns/token/hashDnsToken'

export function readDnsSettings(
  userId: string,
  storedDnsItem: Record<string, unknown> | undefined,
): DnsSettings | null {
  if (!storedDnsItem) return null
  const { token, tokenHash, timeZone, createdAt, tokenCreatedAt } = storedDnsItem
  if (
    typeof token !== 'string' ||
    typeof timeZone !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof tokenCreatedAt !== 'string' ||
    tokenHash !== hashDnsToken(token)
  ) {
    throw new MalformedDnsSettingsError(userId)
  }
  return { token, timeZone, createdAt, tokenCreatedAt }
}
