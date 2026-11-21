import type { DnsSettings } from '../../src/dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../src/dns/contracts/DnsSettingsStore'
import type { DnsTokenLookup, ValidatedDnsOwner } from '../../src/dns/contracts/DnsTokenLookup'
import { hashDnsToken } from '../../src/dns/token/hashDnsToken'

export class InMemoryDnsSettingsStore implements DnsSettingsStore, DnsTokenLookup {
  private readonly dnsSettingsByUser = new Map<string, DnsSettings>()
  private readonly userIdByTokenHash = new Map<string, string>()

  async findDnsSettings(userId: string): Promise<DnsSettings | null> {
    return this.dnsSettingsByUser.get(userId) ?? null
  }

  async createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean> {
    const newTokenHash = hashDnsToken(newDnsSettings.token)
    if (this.dnsSettingsByUser.has(userId) || this.userIdByTokenHash.has(newTokenHash)) {
      return false
    }
    this.dnsSettingsByUser.set(userId, newDnsSettings)
    this.userIdByTokenHash.set(newTokenHash, userId)
    return true
  }

  async replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean> {
    const stored = this.dnsSettingsByUser.get(userId)
    const rotatedTokenHash = hashDnsToken(rotatedDnsSettings.token)
    if (stored?.token !== currentDnsSettings.token) return false
    if (stored.timeZone !== currentDnsSettings.timeZone) return false
    if (this.userIdByTokenHash.has(rotatedTokenHash)) return false
    this.dnsSettingsByUser.set(userId, rotatedDnsSettings)
    this.userIdByTokenHash.delete(hashDnsToken(currentDnsSettings.token))
    this.userIdByTokenHash.set(rotatedTokenHash, userId)
    return true
  }

  async changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean> {
    const stored = this.dnsSettingsByUser.get(userId)
    if (stored?.token !== currentDnsSettings.token) return false
    this.dnsSettingsByUser.set(userId, { ...stored, timeZone })
    return true
  }

  async findValidatedDnsOwner(tokenHash: string): Promise<ValidatedDnsOwner | null> {
    const userId = this.userIdByTokenHash.get(tokenHash)
    if (userId === undefined) return null
    const dnsSettings = this.dnsSettingsByUser.get(userId)
    if (!dnsSettings || hashDnsToken(dnsSettings.token) !== tokenHash) return null
    return { userId, dnsSettings }
  }

  plantOrphanTokenLookup(userId: string, tokenHash: string): void {
    this.userIdByTokenHash.set(tokenHash, userId)
  }
}
