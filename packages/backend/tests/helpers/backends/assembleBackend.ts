import type { ApiStores } from '../../../src/composition/ApiStores'
import { createApiUseCases } from '../../../src/composition/createApiUseCases'
import { ApplyAllDueChangesUseCase } from '../../../src/cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../../../src/cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { createApiApp } from '../../../src/http/app/createApiApp'
import { buildSequentialTokens } from '../buildSequentialTokens'
import type { FakeClock } from '../FakeClock'
import type { TestBackend } from '../testBackends'

type BackendControls = Pick<
  TestBackend,
  'setCooldownHours' | 'plantOrphanTokenLookup' | 'dispose'
>

export function assembleBackend(
  stores: ApiStores,
  clock: FakeClock,
  maxRulesPerUser: number,
  controls: BackendControls,
): TestBackend {
  const useCases = createApiUseCases(stores, clock.now, maxRulesPerUser, buildSequentialTokens())
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
    applyAllDueChanges: () => applyAll.applyAllDueChanges(),
    ...controls,
  }
}
