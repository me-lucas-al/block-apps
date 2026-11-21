import type { DnsSettings } from './DnsSettings'

export interface DnsSettingsStore {
  findDnsSettings(userId: string): Promise<DnsSettings | null>
  createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean>
  replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean>
  changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean>
}
