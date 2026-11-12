import { RuleChangeScheduler } from '../cooldown/scheduling/RuleChangeScheduler'
import { ApplyDueChangesForUserUseCase } from '../cooldown/use-cases/ApplyDueChangesForUserUseCase'
import { CancelPendingChangeUseCase } from '../cooldown/use-cases/CancelPendingChangeUseCase'
import { ListPendingChangesUseCase } from '../cooldown/use-cases/ListPendingChangesUseCase'
import { RequestRuleRemovalUseCase } from '../cooldown/use-cases/RequestRuleRemovalUseCase'
import { RequestRuleUpdateUseCase } from '../cooldown/use-cases/RequestRuleUpdateUseCase'
import { ReportDeviceStatusUseCase } from '../devices/use-cases/ReportDeviceStatusUseCase'
import type { Clock } from '../domain/time/Clock'
import type { ApiUseCases } from '../http/app/ApiUseCases'
import { CreateBlockRuleUseCase } from '../rules/use-cases/CreateBlockRuleUseCase'
import { ListBlockRulesUseCase } from '../rules/use-cases/ListBlockRulesUseCase'
import type { ApiStores } from './ApiStores'

export function createApiUseCases(stores: ApiStores, clock: Clock): ApiUseCases {
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
    createBlockRule: new CreateBlockRuleUseCase(stores.blockRuleStore),
    listBlockRules: new ListBlockRulesUseCase(stores.blockRuleStore),
    requestRuleUpdate: new RequestRuleUpdateUseCase(ruleChangeScheduler),
    requestRuleRemoval: new RequestRuleRemovalUseCase(ruleChangeScheduler),
    listPendingChanges: new ListPendingChangesUseCase(stores.pendingChangeStore),
    applyDueChangesForUser,
    cancelPendingChange: new CancelPendingChangeUseCase(stores.pendingChangeStore),
    reportDeviceStatus: new ReportDeviceStatusUseCase(stores.deviceStore, clock),
  }
}
