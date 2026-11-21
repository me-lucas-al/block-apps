import type { DnsSettings } from './DnsSettings'

export type ValidatedDnsOwner = {
  readonly userId: string
  readonly dnsSettings: DnsSettings
}

export interface DnsTokenLookup {
  findValidatedDnsOwner(tokenHash: string): Promise<ValidatedDnsOwner | null>
}
