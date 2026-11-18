import { ConflictError } from '../../domain/errors/ConflictError'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { DnsSettings, DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'

export class RotateDnsTokenUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly now: () => Date,
  ) {}

  async rotateDnsToken(userId: string): Promise<DnsSettings> {
    const currentDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!currentDnsSettings) throw new NotFoundError('dns profile not found')
    const rotatedDnsSettings = {
      token: this.generateToken(),
      timeZone: currentDnsSettings.timeZone,
      createdAt: this.now().toISOString(),
    }
    const replaced = await this.dnsSettingsStore.replaceDnsToken(
      userId,
      currentDnsSettings,
      rotatedDnsSettings,
    )
    if (!replaced) throw new ConflictError('dns profile changed, try again')
    return rotatedDnsSettings
  }
}
