import type { ApiStores } from '../../../src/composition/ApiStores'
import { InMemoryDnsSettingsStore } from '../InMemoryDnsSettingsStore'
import { InMemoryRuleDatabase } from '../InMemoryRuleDatabase'

export type InMemoryApiStores = {
  readonly stores: ApiStores
  readonly ruleDatabase: InMemoryRuleDatabase
  readonly dnsStore: InMemoryDnsSettingsStore
}

export function buildInMemoryApiStores(): InMemoryApiStores {
  const ruleDatabase = new InMemoryRuleDatabase()
  const dnsStore = new InMemoryDnsSettingsStore()
  const stores: ApiStores = {
    blockRuleStore: ruleDatabase,
    pendingChangeStore: ruleDatabase,
    dueChangeApplier: ruleDatabase,
    cooldownSettingsStore: ruleDatabase,
    deviceStore: ruleDatabase,
    dnsSettingsStore: dnsStore,
    dnsTokenLookup: dnsStore,
  }
  return { stores, ruleDatabase, dnsStore }
}
