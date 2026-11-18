export type DnsSettings = {
  readonly token: string
  readonly timeZone: string
  readonly createdAt: string
}

export interface DnsSettingsStore {
  findDnsSettings(userId: string): Promise<DnsSettings | null>
  saveDnsSettings(userId: string, settings: DnsSettings, previousTokenHash: string | null): Promise<void>
  findUserIdByDnsTokenHash(tokenHash: string): Promise<string | null>
}
