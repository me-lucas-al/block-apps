import type { DnsTokenLookup } from '../../../../src/dns/contracts/DnsTokenLookup'
import type { SiteRuleReader } from '../../../../src/dns/contracts/SiteRuleReader'

function failBecauseStoreMustNotBeTouched(operation: string): never {
  throw new Error(`store must not be touched, but ${operation} was called`)
}

export const untouchableTokenLookup: DnsTokenLookup = {
  findValidatedDnsOwner: () => failBecauseStoreMustNotBeTouched('findValidatedDnsOwner'),
}

export const untouchableSiteRuleReader: SiteRuleReader = {
  listSiteRulesByUser: () => failBecauseStoreMustNotBeTouched('listSiteRulesByUser'),
}

export const outageTokenLookup: DnsTokenLookup = {
  findValidatedDnsOwner: async () => {
    throw new Error('dynamodb outage')
  },
}

export const outageSiteRuleReader: SiteRuleReader = {
  listSiteRulesByUser: async () => {
    throw new Error('dynamodb outage')
  },
}
