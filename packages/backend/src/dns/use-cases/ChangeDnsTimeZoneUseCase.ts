import { ConflictError } from '../../domain/errors/ConflictError'
import type { DnsSettings } from '../contracts/DnsSettings'
import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'

export class ChangeDnsTimeZoneUseCase {
  constructor(private readonly dnsSettingsStore: DnsSettingsStore) {}

  async changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<DnsSettings> {
    if (currentDnsSettings.timeZone === timeZone) return currentDnsSettings
    const changed = await this.dnsSettingsStore.changeDnsTimeZone(
      userId,
      currentDnsSettings,
      timeZone,
    )
    if (!changed) throw new ConflictError('dns profile changed, try again')
    return { ...currentDnsSettings, timeZone }
  }
}
