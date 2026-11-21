import { DEFAULT_MAX_RULES_PER_USER } from '../../../src/rules/quota/readMaxRulesPerUser'
import { FakeClock } from '../FakeClock'
import type { BackendFactory } from '../testBackends'
import { assembleBackend } from './assembleBackend'
import { buildInMemoryApiStores } from './buildInMemoryApiStores'

export const inMemoryBackendFactory: BackendFactory = {
  name: 'in-memory',
  create: async (maxRulesPerUser = DEFAULT_MAX_RULES_PER_USER) => {
    const { stores, ruleDatabase, dnsStore } = buildInMemoryApiStores()
    return assembleBackend(stores, new FakeClock(), maxRulesPerUser, {
      setCooldownHours: async (userId, cooldownHours) => {
        ruleDatabase.setCooldownHours(userId, cooldownHours)
      },
      plantOrphanTokenLookup: async (userId, tokenHash) => {
        dnsStore.plantOrphanTokenLookup(userId, tokenHash)
      },
      dispose: async () => {},
    })
  },
}
