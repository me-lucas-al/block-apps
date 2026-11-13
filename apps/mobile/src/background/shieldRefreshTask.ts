import { BackgroundTaskResult, registerTaskAsync } from 'expo-background-task'
import { defineTask } from 'expo-task-manager'
import { createDeviceAdapters } from '../adapters/blocker/createDeviceAdapters'

const SHIELD_REFRESH_TASK_NAME = 'block-apps-shield-refresh'
const SHIELD_REFRESH_INTERVAL_MINUTES = 15

defineTask(SHIELD_REFRESH_TASK_NAME, async () => {
  try {
    createDeviceAdapters().blocker.refreshEnforcement()
    return BackgroundTaskResult.Success
  } catch {
    return BackgroundTaskResult.Failed
  }
})

export function scheduleShieldRefreshInBackground(): Promise<void> {
  return registerTaskAsync(SHIELD_REFRESH_TASK_NAME, {
    minimumInterval: SHIELD_REFRESH_INTERVAL_MINUTES,
  })
}
