import type { DnsSettings } from '../../../src/dns/contracts/DnsSettings'

const CREATED_AT = '2026-11-11T12:00:00.000Z'

export function buildDnsSettings(token: string, timeZone = 'UTC'): DnsSettings {
  return { token, timeZone, createdAt: CREATED_AT, tokenCreatedAt: CREATED_AT }
}
