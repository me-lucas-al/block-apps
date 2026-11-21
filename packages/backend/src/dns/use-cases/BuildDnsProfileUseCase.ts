import { NotFoundError } from '../../domain/errors/NotFoundError'
import type { DnsSettingsStore } from '../contracts/DnsSettingsStore'
import { buildDnsProfile } from '../profile/buildDnsProfile'

export class BuildDnsProfileUseCase {
  constructor(
    private readonly dnsSettingsStore: DnsSettingsStore,
    private readonly dnsHost: string | undefined,
  ) {}

  async buildDnsProfileFor(userId: string): Promise<string> {
    if (!this.dnsHost) throw new NotFoundError('dns blocking is not configured')
    const dnsSettings = await this.dnsSettingsStore.findDnsSettings(userId)
    if (!dnsSettings) throw new NotFoundError('dns profile not found')
    return buildDnsProfile({ userId, token: dnsSettings.token, dnsHostname: this.dnsHost })
  }
}
