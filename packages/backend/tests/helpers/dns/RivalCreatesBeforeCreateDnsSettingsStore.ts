import type { DnsSettings } from '../../../src/dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../../src/dns/contracts/DnsSettingsStore'
import { DelegatingDnsSettingsStore } from './DelegatingDnsSettingsStore'

export class RivalCreatesBeforeCreateDnsSettingsStore extends DelegatingDnsSettingsStore {
  constructor(
    innerStore: DnsSettingsStore,
    private readonly rivalDnsSettings: DnsSettings,
  ) {
    super(innerStore)
  }

  override async createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean> {
    await this.innerStore.createDnsSettings(userId, this.rivalDnsSettings)
    return this.innerStore.createDnsSettings(userId, newDnsSettings)
  }
}
