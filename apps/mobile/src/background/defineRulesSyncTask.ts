import { BackgroundTaskResult } from 'expo-background-task'
import { defineTask } from 'expo-task-manager'
import { AppBlocker } from '../../modules/app-blocker'
import { createMobileServices } from '../adapters/createMobileServices'
import { createRulesSync } from '../sync/createRulesSync'
import { RULES_SYNC_TASK_NAME } from './rulesSyncTaskConfig'
import { syncRulesInBackground } from './syncRulesInBackground'

defineTask(RULES_SYNC_TASK_NAME, async () => {
  const outcome = await syncRulesInBackground(() =>
    createRulesSync(createMobileServices(), AppBlocker),
  )
  return outcome === 'success' ? BackgroundTaskResult.Success : BackgroundTaskResult.Failed
})
