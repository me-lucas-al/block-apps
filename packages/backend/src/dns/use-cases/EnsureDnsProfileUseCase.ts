import { ConflictError } from '../../domain/errors/ConflictError'
import { canonicalizeTimeZone } from '../time-zone/canonicalizeTimeZone'
import type { DnsSettings, DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'

export class EnsureDnsProfileUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly now: () => Date,
  ) {}

  async ensureDnsProfile(userId: string, requestedTimeZone: string): Promise<DnsSettings> {
    const timeZone = canonicalizeTimeZone(requestedTimeZone)
    const currentDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!currentDnsSettings) return this.createProfile(userId, timeZone)
    if (currentDnsSettings.timeZone === timeZone) return currentDnsSettings
    const changed = await this.dnsSettingsStore.changeDnsTimeZone(
      userId,
      currentDnsSettings,
      timeZone,
    )
    if (!changed) throw new ConflictError('dns profile changed, try again')
    return { ...currentDnsSettings, timeZone }
  }

  private async createProfile(userId: string, timeZone: string): Promise<DnsSettings> {
    const newDnsSettings = {
      token: this.generateToken(),
      timeZone,
      createdAt: this.now().toISOString(),
    }
    if (await this.dnsSettingsStore.createDnsSettings(userId, newDnsSettings)) {
      return newDnsSettings
    }
    const concurrentDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!concurrentDnsSettings) throw new ConflictError('dns profile changed, try again')
    return concurrentDnsSettings
  }
}
