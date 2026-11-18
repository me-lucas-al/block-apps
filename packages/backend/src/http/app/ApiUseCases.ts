import type { ApplyDueChangesForUserUseCase } from '../../cooldown/use-cases/ApplyDueChangesForUserUseCase'
import type { CancelPendingChangeUseCase } from '../../cooldown/use-cases/CancelPendingChangeUseCase'
import type { ListPendingChangesUseCase } from '../../cooldown/use-cases/ListPendingChangesUseCase'
import type { RequestRuleRemovalUseCase } from '../../cooldown/use-cases/RequestRuleRemovalUseCase'
import type { RequestRuleUpdateUseCase } from '../../cooldown/use-cases/RequestRuleUpdateUseCase'
import type { RequestSelectionRemovalUseCase } from '../../cooldown/use-cases/RequestSelectionRemovalUseCase'
import type { EnsureDnsProfileUseCase } from '../../dns/use-cases/EnsureDnsProfileUseCase'
import type { RotateDnsTokenUseCase } from '../../dns/use-cases/RotateDnsTokenUseCase'
import type { ReportDeviceStatusUseCase } from '../../devices/use-cases/ReportDeviceStatusUseCase'
import type { CreateBlockRuleUseCase } from '../../rules/use-cases/CreateBlockRuleUseCase'
import type { ListBlockRulesUseCase } from '../../rules/use-cases/ListBlockRulesUseCase'

export type ApiUseCases = {
  readonly createBlockRule: CreateBlockRuleUseCase
  readonly listBlockRules: ListBlockRulesUseCase
  readonly requestRuleUpdate: RequestRuleUpdateUseCase
  readonly requestRuleRemoval: RequestRuleRemovalUseCase
  readonly requestSelectionRemoval: RequestSelectionRemovalUseCase
  readonly listPendingChanges: ListPendingChangesUseCase
  readonly applyDueChangesForUser: ApplyDueChangesForUserUseCase
  readonly cancelPendingChange: CancelPendingChangeUseCase
  readonly reportDeviceStatus: ReportDeviceStatusUseCase
  readonly ensureDnsProfile: EnsureDnsProfileUseCase
  readonly rotateDnsToken: RotateDnsTokenUseCase
}
