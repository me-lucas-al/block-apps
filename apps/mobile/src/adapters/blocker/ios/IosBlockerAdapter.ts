import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { RulesSnapshot } from '../../../ports/blocker/RulesSnapshot'
import type { IosNativeModule } from './module/IosNativeModule'
import { toIosRulesJson } from './rules/toIosRulesJson'

type IosBlockerDependencies = {
  readonly nativeModule: Pick<IosNativeModule, 'setRules' | 'reapplyShields' | 'recordAppOpened'>
}

export class IosBlockerAdapter implements BlockerPort {
  constructor(private readonly dependencies: IosBlockerDependencies) {}

  applyRules({ rules, pendingChanges, accountId, serverNowIso }: RulesSnapshot): void {
    const pendingRuleIds = pendingChanges.map((change) => change.ruleId)
    this.dependencies.nativeModule.setRules(
      toIosRulesJson(rules),
      accountId,
      pendingRuleIds,
      serverNowIso,
    )
  }

  refreshEnforcement(): void {
    this.dependencies.nativeModule.reapplyShields()
  }

  markAppOpened(): void {
    this.dependencies.nativeModule.recordAppOpened()
  }
}
