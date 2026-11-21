import type { DnsSettings } from '../../../dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../../dns/contracts/DnsSettingsStore'
import type { TableContext } from '../TableContext'
import { findStoredDnsSettings } from './reads/findStoredDnsSettings'
import { changeDnsTimeZone } from './writes/changeDnsTimeZone'
import { createDnsSettings } from './writes/createDnsSettings'
import { replaceDnsToken } from './writes/replaceDnsToken'

export class DynamoDnsSettingsStore implements DnsSettingsStore {
  constructor(private readonly context: TableContext) {}

  findDnsSettings(userId: string): Promise<DnsSettings | null> {
    return findStoredDnsSettings(this.context, userId)
  }

  createDnsSettings(userId: string, newDnsSettings: DnsSettings): Promise<boolean> {
    return createDnsSettings(this.context, userId, newDnsSettings)
  }

  replaceDnsToken(
    userId: string,
    currentDnsSettings: DnsSettings,
    rotatedDnsSettings: DnsSettings,
  ): Promise<boolean> {
    return replaceDnsToken(this.context, userId, currentDnsSettings, rotatedDnsSettings)
  }

  changeDnsTimeZone(
    userId: string,
    currentDnsSettings: DnsSettings,
    timeZone: string,
  ): Promise<boolean> {
    return changeDnsTimeZone(this.context, userId, currentDnsSettings, timeZone)
  }
}
