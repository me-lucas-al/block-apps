import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { RulesSnapshot } from '../../../ports/blocker/RulesSnapshot'
import type { IosNativeModule } from './module/IosNativeModule'
import { toIosRulesJson } from './rules/toIosRulesJson'

type IosBlockerDependencies = {
  readonly nativeModule: Pick<IosNativeModule, 'setRules' | 'reapplyShields' | 'recordAppOpened'>
}

export class IosBlockerAdapter implements BlockerPort {
  constructor(private readonly dependencies: IosBlockerDependencies) {}

  applyRules(snapshot: RulesSnapshot): Promise<void> {
    return this.dependencies.nativeModule.setRules({
      rulesJson: toIosRulesJson(snapshot.rules),
      ownerId: snapshot.accountId,
      pendingRuleIds: snapshot.pendingChanges.map((change) => change.ruleId),
      serverNowIso: snapshot.serverNowIso,
      legacyOwnerId: snapshot.legacyAccountId,
    })
  }

  refreshEnforcement(): Promise<void> {
    return this.dependencies.nativeModule.reapplyShields()
  }

  markAppOpened(): Promise<void> {
    return this.dependencies.nativeModule.recordAppOpened()
  }
}
