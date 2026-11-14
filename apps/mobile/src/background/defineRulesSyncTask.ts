import { BackgroundTaskResult } from 'expo-background-task'
import { defineTask } from 'expo-task-manager'
import { Platform } from 'react-native'
import { AppBlocker } from '../../modules/app-blocker'
import { createPlatformAdapters } from '../adapters/blocker/createPlatformAdapters'
import { createMobileServices } from '../adapters/createMobileServices'
import { createRulesSync } from '../sync/createRulesSync'
import { RULES_SYNC_TASK_NAME } from './rulesSyncTaskConfig'
import { syncRulesInBackground } from './syncRulesInBackground'

defineTask(RULES_SYNC_TASK_NAME, async () => {
  const { blocker } = createPlatformAdapters({ platformOs: Platform.OS, androidModule: AppBlocker })
  const outcome = await syncRulesInBackground(() => createRulesSync(createMobileServices(), blocker))
  return outcome === 'success' ? BackgroundTaskResult.Success : BackgroundTaskResult.Failed
})
