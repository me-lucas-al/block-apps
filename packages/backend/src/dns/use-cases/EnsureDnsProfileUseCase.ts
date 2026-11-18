import type { DnsSettings, DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'
import { hashDnsToken } from '../token/hashDnsToken'
import { validateTimeZone } from '../validateTimeZone'

export class EnsureDnsProfileUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly now: () => Date,
  ) {}

  async ensureDnsProfile(userId: string, timeZone: string): Promise<DnsSettings> {
    validateTimeZone(timeZone)
    const existing = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!existing) return this.createProfile(userId, timeZone)
    if (existing.timeZone === timeZone) return existing
    const updated = { ...existing, timeZone }
    await this.dnsSettingsStore.saveDnsSettings(userId, updated, hashDnsToken(existing.token))
    return updated
  }

  private async createProfile(userId: string, timeZone: string): Promise<DnsSettings> {
    const created = {
      token: this.generateToken(),
      timeZone,
      createdAt: this.now().toISOString(),
    }
    await this.dnsSettingsStore.saveDnsSettings(userId, created, null)
    return created
  }
}
