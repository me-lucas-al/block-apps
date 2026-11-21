import type { DnsSettings } from '../../../src/dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../../src/dns/contracts/DnsSettingsStore'

export class DelegatingDnsSettingsStore implements DnsSettingsStore {
  constructor(protected readonly innerStore: DnsSettingsStore) {}

  findDnsSettings(userId: string): Promise<DnsSettings | null> {
    return this.innerStore.findDnsSettings(userId)
  }

  createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean> {
    return this.innerStore.createDnsSettings(userId, newDnsSettings)
  }

  replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean> {
    return this.innerStore.replaceDnsToken(userId, currentDnsSettings, rotatedDnsSettings)
  }

  changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean> {
    return this.innerStore.changeDnsTimeZone(userId, currentDnsSettings, timeZone)
  }
}
