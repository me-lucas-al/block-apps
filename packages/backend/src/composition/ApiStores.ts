import type { CooldownSettingsStore } from '../cooldown/contracts/CooldownSettingsStore'
import type { DueChangeApplier } from '../cooldown/contracts/DueChangeApplier'
import type { PendingChangeStore } from '../cooldown/contracts/PendingChangeStore'
import type { DeviceStore } from '../devices/contracts/DeviceStore'
import type { BlockRuleStore } from '../rules/contracts/BlockRuleStore'

export type ApiStores = {
  readonly blockRuleStore: BlockRuleStore
  readonly pendingChangeStore: PendingChangeStore
  readonly dueChangeApplier: DueChangeApplier
  readonly cooldownSettingsStore: CooldownSettingsStore
  readonly deviceStore: DeviceStore
}
