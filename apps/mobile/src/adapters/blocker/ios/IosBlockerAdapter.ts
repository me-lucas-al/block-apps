import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { BlockerPort } from '../../../ports/blocker/BlockerPort'
import type { GroupSelectionPort } from '../../../ports/groupselection/GroupSelectionPort'
import type { IosNativeModule } from './module/IosNativeModule'
import { toIosRulesJson } from './rules/toIosRulesJson'

type IosBlockerDependencies = {
  readonly nativeModule: Pick<IosNativeModule, 'setRules' | 'reapplyShields'>
  readonly groupSelection: Pick<GroupSelectionPort, 'hasPendingRemoval' | 'commitPendingRemoval'>
}

export class IosBlockerAdapter implements BlockerPort {
  constructor(private readonly dependencies: IosBlockerDependencies) {}

  applyRules(rules: readonly BlockRule[], pendingChanges: readonly PendingRuleChange[]): void {
    this.commitSelectionRemovalsWhoseCooldownEnded(rules, pendingChanges)
    this.dependencies.nativeModule.setRules(toIosRulesJson(rules))
  }

  refreshEnforcement(): void {
    this.dependencies.nativeModule.reapplyShields()
  }

  private commitSelectionRemovalsWhoseCooldownEnded(
    rules: readonly BlockRule[],
    pendingChanges: readonly PendingRuleChange[],
  ): void {
    const { groupSelection } = this.dependencies
    for (const rule of rules) {
      if (rule.targetType !== 'iosSelection') continue
      if (!groupSelection.hasPendingRemoval(rule.id)) continue
      if (pendingChanges.some((change) => change.ruleId === rule.id)) continue
      groupSelection.commitPendingRemoval(rule.id)
    }
  }
}
