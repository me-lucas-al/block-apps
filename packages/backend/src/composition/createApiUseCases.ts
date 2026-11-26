import { RuleChangeScheduler } from '../cooldown/scheduling/RuleChangeScheduler'
import { ApplyDueChangesForUserUseCase } from '../cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { CancelPendingChangeUseCase } from '../cooldown/use-cases/CancelPendingChangeUseCase'
import { ListPendingChangesUseCase } from '../cooldown/use-cases/ListPendingChangesUseCase'
import { RequestRuleRemovalUseCase } from '../cooldown/use-cases/RequestRuleRemovalUseCase'
import { RequestRuleUpdateUseCase } from '../cooldown/use-cases/RequestRuleUpdateUseCase'
import { RequestSelectionRemovalUseCase } from '../cooldown/use-cases/RequestSelectionRemovalUseCase'
import { ChangeDnsTimeZoneUseCase } from '../dns/use-cases/ChangeDnsTimeZoneUseCase'
import { CreateDnsProfileUseCase } from '../dns/use-cases/CreateDnsProfileUseCase'
import { EnsureDnsProfileUseCase } from '../dns/use-cases/EnsureDnsProfileUseCase'
import { RotateDnsTokenUseCase } from '../dns/use-cases/RotateDnsTokenUseCase'
import { BuildDnsProfileUseCase } from '../dns/use-cases/BuildDnsProfileUseCase'
import { generateDnsToken, type DnsTokenGenerator } from '../dns/token/generateDnsToken'
import { ReportDeviceStatusUseCase } from '../devices/use-cases/ReportDeviceStatusUseCase'
import type { Clock } from '../domain/time/Clock'
import type { ApiUseCases } from '../http/app/ApiUseCases'
import { CreateBlockRuleUseCase } from '../rules/use-cases/CreateBlockRuleUseCase'
import { RuleQuotaGuard } from '../rules/quota/RuleQuotaGuard'
import { ListBlockRulesUseCase } from '../rules/use-cases/ListBlockRulesUseCase'
import { TightenRuleUseCase } from '../rules/use-cases/TightenRuleUseCase'
import type { ApiStores } from './ApiStores'

export type DnsOptions = {
  readonly generateToken?: DnsTokenGenerator
  readonly dnsHost?: string
}

export function createApiUseCases(
  stores: ApiStores,
  clock: Clock,
  maxRulesPerUser: number,
  dnsOptions: DnsOptions = {},
): ApiUseCases {
  const generateToken = dnsOptions.generateToken ?? generateDnsToken
  const applyDueChangesForUser = new ApplyDueChangesForUserUseCase(
    stores.pendingChangeStore,
    stores.dueChangeApplier,
    clock,
  )
  const ruleChangeScheduler = new RuleChangeScheduler(
    stores.blockRuleStore,
    stores.pendingChangeStore,
    stores.cooldownSettingsStore,
    applyDueChangesForUser,
    clock,
  )
  return {
    createBlockRule: new CreateBlockRuleUseCase(
      stores.blockRuleStore,
      new RuleQuotaGuard(stores.blockRuleStore, maxRulesPerUser),
    ),
    listBlockRules: new ListBlockRulesUseCase(stores.blockRuleStore),
    requestRuleUpdate: new RequestRuleUpdateUseCase(
      stores.blockRuleStore,
      new TightenRuleUseCase(stores.blockRuleStore),
      ruleChangeScheduler,
    ),
    requestRuleRemoval: new RequestRuleRemovalUseCase(ruleChangeScheduler),
    requestSelectionRemoval: new RequestSelectionRemovalUseCase(ruleChangeScheduler),
    listPendingChanges: new ListPendingChangesUseCase(stores.pendingChangeStore),
    applyDueChangesForUser,
    cancelPendingChange: new CancelPendingChangeUseCase(stores.pendingChangeStore),
    reportDeviceStatus: new ReportDeviceStatusUseCase(stores.deviceStore, clock),
    ensureDnsProfile: new EnsureDnsProfileUseCase(
      stores.dnsSettingsStore,
      new CreateDnsProfileUseCase(stores.dnsSettingsStore, generateToken, clock),
      new ChangeDnsTimeZoneUseCase(stores.dnsSettingsStore),
    ),
    rotateDnsToken: new RotateDnsTokenUseCase(stores.dnsSettingsStore, generateToken, clock),
    buildDnsProfile: new BuildDnsProfileUseCase(stores.dnsSettingsStore, dnsOptions.dnsHost),
  }
}
