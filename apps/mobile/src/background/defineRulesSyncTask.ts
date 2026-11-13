import { BackgroundTaskResult } from 'expo-background-task'
import { defineTask } from 'expo-task-manager'
import { createServices } from '../services/createServices'
import { RULES_SYNC_TASK_NAME } from './rulesSyncTask'
import { syncRulesInBackground } from './syncRulesInBackground'

defineTask(RULES_SYNC_TASK_NAME, async () => {
  const outcome = await syncRulesInBackground(() => createServices().rulesSync)
  return outcome === 'success' ? BackgroundTaskResult.Success : BackgroundTaskResult.Failed
})
