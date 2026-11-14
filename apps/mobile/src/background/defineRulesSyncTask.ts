import { BackgroundTaskResult } from 'expo-background-task'
import { defineTask } from 'expo-task-manager'
import { createDeviceAdapters } from '../adapters/blocker/createDeviceAdapters'
import { createMobileServices } from '../adapters/createMobileServices'
import { createRulesSync } from '../sync/createRulesSync'
import { RULES_SYNC_TASK_NAME } from './rulesSyncTaskConfig'
import { syncRulesInBackground } from './syncRulesInBackground'

defineTask(RULES_SYNC_TASK_NAME, async () => {
  const { blocker } = createDeviceAdapters()
  const outcome = await syncRulesInBackground(() => createRulesSync(createMobileServices(), blocker))
  try {
    blocker.refreshEnforcement()
  } catch {
    return BackgroundTaskResult.Failed
  }
  return outcome === 'success' ? BackgroundTaskResult.Success : BackgroundTaskResult.Failed
})
