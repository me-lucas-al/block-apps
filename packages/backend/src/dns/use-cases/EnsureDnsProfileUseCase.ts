import { ConflictError } from '../../domain/errors/ConflictError'
import type { DnsSettings } from '../contracts/DnsSettings'
import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import { canonicalizeTimeZone } from '../time-zone/canonicalizeTimeZone'
import type { ChangeDnsTimeZoneUseCase } from './ChangeDnsTimeZoneUseCase'
import type { CreateDnsProfileUseCase } from './CreateDnsProfileUseCase'

export class EnsureDnsProfileUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly createDnsProfile: CreateDnsProfileUseCase,
    private readonly changeDnsTimeZone: ChangeDnsTimeZoneUseCase,
  ) {}

  async ensureDnsProfile(userId: string, requestedTimeZone: string): Promise<DnsSettings> {
    const timeZone = canonicalizeTimeZone(requestedTimeZone)
    const existingDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (existingDnsSettings) {
      return this.changeDnsTimeZone.changeDnsTimeZone(userId, existingDnsSettings, timeZone)
    }
    const createdDnsSettings = await this.createDnsProfile.createDnsProfileIfAbsent(userId, timeZone)
    if (createdDnsSettings) return createdDnsSettings
    const concurrentDnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!concurrentDnsSettings) throw new ConflictError('dns profile changed, try again')
    return this.changeDnsTimeZone.changeDnsTimeZone(userId, concurrentDnsSettings, timeZone)
  }
}
