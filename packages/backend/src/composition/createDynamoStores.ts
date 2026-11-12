import { DynamoDueChangeApplier } from '../storage/dynamodb/changes/DynamoDueChangeApplier'
import { DynamoPendingChangeStore } from '../storage/dynamodb/changes/DynamoPendingChangeStore'
import { DynamoDeviceStore } from '../storage/dynamodb/devices/DynamoDeviceStore'
import { DynamoBlockRuleStore } from '../storage/dynamodb/rules/DynamoBlockRuleStore'
import { DynamoCooldownSettingsStore } from '../storage/dynamodb/settings/DynamoCooldownSettingsStore'
import type { TableContext } from '../storage/dynamodb/TableContext'
import type { ApiStores } from './ApiStores'

export function createDynamoStores(context: TableContext): ApiStores {
  return {
    blockRuleStore: new DynamoBlockRuleStore(context),
    pendingChangeStore: new DynamoPendingChangeStore(context),
    dueChangeApplier: new DynamoDueChangeApplier(context),
    cooldownSettingsStore: new DynamoCooldownSettingsStore(context),
    deviceStore: new DynamoDeviceStore(context),
  }
}
