import type { DnsSettings } from '../../../src/dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../../src/dns/contracts/DnsSettingsStore'
import { DelegatingDnsSettingsStore } from './DelegatingDnsSettingsStore'

export class RivalRotatesAfterReadDnsSettingsStore extends DelegatingDnsSettingsStore {
  private rivalAlreadyRotated = false

  constructor(
    innerStore: DnsSettingsStore,
    private readonly rivalDnsSettings: DnsSettings,
  ) {
    super(innerStore)
  }

  override async findDnsSettings(userId: string): Promise<DnsSettings | null> {
    const currentDnsSettings = await this.innerStore.findDnsSettings(userId)
    if (!currentDnsSettings || this.rivalAlreadyRotated) return currentDnsSettings
    this.rivalAlreadyRotated = true
    await this.innerStore.replaceDnsToken(userId, currentDnsSettings, this.rivalDnsSettings)
    return currentDnsSettings
  }
}
