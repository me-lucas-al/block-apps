import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { DnsSettings, DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'
import { hashDnsToken } from '../token/hashDnsToken'

export class RotateDnsTokenUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly now: () => Date,
  ) {}

  async rotateDnsToken(userId: string): Promise<DnsSettings> {
    const existing = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!existing) throw new NotFoundError('dns profile not found')
    const rotated = {
      token: this.generateToken(),
      timeZone: existing.timeZone,
      createdAt: this.now().toISOString(),
    }
    await this.dnsSettingsStore.saveDnsSettings(userId, rotated, hashDnsToken(existing.token))
    return rotated
  }
}
