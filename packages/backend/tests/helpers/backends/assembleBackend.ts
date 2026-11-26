import type { ApiStores } from '../../../src/composition/ApiStores'
import { createApiUseCases } from '../../../src/composition/createApiUseCases'
import { assembleDohResolverApp } from '../../../src/composition/doh/assembleDohResolverApp'
import type { SiteRuleReader } from '../../../src/dns/contracts/SiteRuleReader'
import { ApplyAllDueChangesUseCase } from '../../../src/cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../../../src/cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { createApiApp } from '../../../src/http/app/createApiApp'
import { buildSequentialTokens } from '../buildSequentialTokens'
import type { FakeClock } from '../FakeClock'
import type { TestBackend } from '../testBackends'

const TEST_DNS_HOST = 'dns.example.test'

type BackendControls = Pick<
  TestBackend,
  'setCooldownHours' | 'plantOrphanTokenLookup' | 'dispose'
>

export function assembleBackend(
  stores: ApiStores,
  siteRuleReader: SiteRuleReader,
  clock: FakeClock,
  maxRulesPerUser: number,
  controls: BackendControls,
): TestBackend {
  const useCases = createApiUseCases(stores, clock.now, maxRulesPerUser, {
    generateToken: buildSequentialTokens(),
    dnsHost: TEST_DNS_HOST,
  })
  const applyAll = new ApplyAllDueChangesUseCase(
    stores.pendingChangeStore,
    new ApplyDueChangesForUserUseCase(stores.pendingChangeStore, stores.dueChangeApplier, clock.now),
    clock.now,
  )
  return {
    app: createApiApp(useCases),
    clock,
    dnsSettingsStore: stores.dnsSettingsStore,
    dnsTokenLookup: stores.dnsTokenLookup,
    createDnsResolver: (upstream) =>
      assembleDohResolverApp(
        stores.dnsSettingsStore,
        stores.dnsTokenLookup,
        siteRuleReader,
        upstream,
        clock.now,
      ),
    applyAllDueChanges: () => applyAll.applyAllDueChanges(),
    ...controls,
  }
}
