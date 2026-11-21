import { ConflictError } from '../../domain/errors/ConflictError'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { Clock } from '../../domain/time/Clock'
import type { DnsSettings } from '../contracts/DnsSettings'
import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import type { DnsTokenGenerator } from '../token/generateDnsToken'

export class RotateDnsTokenUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly generateToken: DnsTokenGenerator,
    private readonly clock: Clock,
  ) {}

  async rotateDnsToken(userId: string): Promise<DnsSettings> {
    const currentDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!currentDnsSettings) throw new NotFoundError('dns profile not found')
    const rotatedDnsSettings: DnsSettings = {
      ...currentDnsSettings,
      token: this.generateToken(),
      tokenCreatedAt: this.clock().toISOString(),
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
