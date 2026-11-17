import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { RulesSnapshot } from '../../../ports/blocker/RulesSnapshot'
import type { GroupSelectionPort } from '../../../ports/groupselection/GroupSelectionPort'
import type { IosNativeModule } from './module/IosNativeModule'
import { toIosRulesJson } from './rules/toIosRulesJson'

type HeldRemovalPort = Pick<
  GroupSelectionPort,
  'hasPendingRemoval' | 'readPendingRemovalHold' | 'commitPendingRemoval' | 'discardPendingRemoval'
>

type IosBlockerDependencies = {
  readonly nativeModule: Pick<IosNativeModule, 'setRules' | 'reapplyShields' | 'recordAppOpened'>
  readonly groupSelection: HeldRemovalPort
  readonly currentTimeMillis?: () => number
}

export class IosBlockerAdapter implements BlockerPort {
  constructor(private readonly dependencies: IosBlockerDependencies) {}

  applyRules({ rules, pendingChanges, accountId }: RulesSnapshot): void {
    this.settleHeldSelectionRemovals(rules, pendingChanges)
    this.dependencies.nativeModule.setRules(toIosRulesJson(rules), accountId)
  }

  refreshEnforcement(): void {
    this.dependencies.nativeModule.reapplyShields()
  }

  markAppOpened(): void {
    this.dependencies.nativeModule.recordAppOpened()
  }

  private settleHeldSelectionRemovals(
    rules: readonly BlockRule[],
    pendingChanges: readonly PendingRuleChange[],
  ): void {
    const { groupSelection } = this.dependencies
    for (const rule of rules) {
      if (rule.targetType !== 'iosSelection') continue
      if (!groupSelection.hasPendingRemoval(rule.id)) continue
      const effectiveAtIso = groupSelection.readPendingRemovalHold(rule.id)
      if (!effectiveAtIso) continue
      if (pendingChanges.some((change) => change.ruleId === rule.id)) continue
      if (this.hasCooldownEnded(effectiveAtIso)) groupSelection.commitPendingRemoval(rule.id)
      else groupSelection.discardPendingRemoval(rule.id)
    }
  }

  private hasCooldownEnded(effectiveAtIso: string): boolean {
    const currentTimeMillis = this.dependencies.currentTimeMillis ?? Date.now
    return currentTimeMillis() >= Date.parse(effectiveAtIso)
  }
}
