import type { Hono } from 'hono'
import type { ApiStores } from '../../src/composition/ApiStores'
import { createApiUseCases } from '../../src/composition/createApiUseCases'
import { createDnsResolverApp } from '../../src/composition/createDnsResolverApp'
import { ApplyAllDueChangesUseCase } from '../../src/cooldown/use-cases/ApplyAllDueChangesUseCase'
import { ApplyDueChangesForUserUseCase } from '../../src/cooldown/use-cases/ApplyDueChangesForUserUseCase'
import type { DnsSettingsStore } from '../../src/dns/contracts/DnsSettingsStore'
import type { DohUpstream } from '../../src/dns/contracts/DohUpstream'
import type { SiteRuleReader } from '../../src/dns/contracts/SiteRuleReader'
import type { ApiEnv } from '../../src/http/app/ApiEnv'
import { createApiApp } from '../../src/http/app/createApiApp'
import { buildSequentialTokens } from './buildSequentialTokens'
import type { FakeClock } from './FakeClock'

export type TestBackend = {
  readonly app: Hono<ApiEnv>
  readonly clock: FakeClock
  readonly dnsSettingsStore: DnsSettingsStore
  createDnsResolver(upstream: DohUpstream): Hono
  applyAllDueChanges(): Promise<number>
  setCooldownHours(userId: string, cooldownHours: number): Promise<void>
  dispose(): Promise<void>
}

export function assembleTestBackend(
  stores: ApiStores,
  siteRuleReader: SiteRuleReader,
  clock: FakeClock,
  maxRulesPerUser: number,
  setCooldownHours: TestBackend['setCooldownHours'],
  dispose: TestBackend['dispose'],
): TestBackend {
  const useCases = createApiUseCases(stores, clock.now, maxRulesPerUser, {
    generateToken: buildSequentialTokens(),
    dnsHost: 'dns.example.test',
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
    createDnsResolver: (upstream) =>
      createDnsResolverApp(stores.dnsSettingsStore, siteRuleReader, upstream, clock.now),
    applyAllDueChanges: () => applyAll.applyAllDueChanges(),
    setCooldownHours,
    dispose,
  }
}
