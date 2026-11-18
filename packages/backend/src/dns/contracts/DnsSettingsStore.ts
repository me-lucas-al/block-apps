export type DnsSettings = {
  readonly token: string
  readonly timeZone: string
  readonly createdAt: string
}

export interface DnsSettingsStore {
  findDnsSettings(userId: string): Promise<DnsSettings | null>
  createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean>
  replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean>
  changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean>
  findUserIdByDnsTokenHash(tokenHash: string): Promise<string | null>
}
