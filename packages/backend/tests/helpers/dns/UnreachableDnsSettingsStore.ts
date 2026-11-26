import type { DnsSettings } from '../../../src/dns/contracts/DnsSettings'
import type { DnsSettingsStore } from '../../../src/dns/contracts/DnsSettingsStore'

function failBecauseStoreMustNotBeTouched(operation: string): never {
  throw new Error(`dns settings store must not be touched, but ${operation} was called`)
}

export class UnreachableDnsSettingsStore implements DnsSettingsStore {
  findDnsSettings(): Promise<DnsSettings | null> {
    return failBecauseStoreMustNotBeTouched('findDnsSettings')
  }

  createDnsSettings(): Promise<boolean> {
    return failBecauseStoreMustNotBeTouched('createDnsSettings')
  }

  replaceDnsToken(): Promise<boolean> {
    return failBecauseStoreMustNotBeTouched('replaceDnsToken')
  }

  changeDnsTimeZone(): Promise<boolean> {
    return failBecauseStoreMustNotBeTouched('changeDnsTimeZone')
  }
}
