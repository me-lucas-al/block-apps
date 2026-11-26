import type { Clock } from '../../domain/time/Clock'
import type { DnsSettings } from '../contracts/DnsSettings'
import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'

export class CreateDnsProfileUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly clock: Clock,
  ) {}

  async createDnsProfileIfAbsent(userId: string, timeZone: string): Promise<DnsSettings | null> {
    const createdAt = this.clock().toISOString()
    const newDnsSettings: DnsSettings = {
      token: this.generateToken(),
      timeZone,
      createdAt,
      tokenCreatedAt: createdAt,
    }
    const created = await this.dnsSettingsStore.createDnsSettings(userId, newDnsSettings)
    return created ? newDnsSettings : null
  }
}
