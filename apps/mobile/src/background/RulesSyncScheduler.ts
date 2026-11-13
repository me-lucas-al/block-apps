import type { BackgroundTaskPort } from './BackgroundTaskPort'
import { RULES_SYNC_INTERVAL_MINUTES, RULES_SYNC_TASK_NAME } from './rulesSyncTaskConfig'

export class RulesSyncScheduler {
  constructor(private readonly backgroundTasks: BackgroundTaskPort) {}

  async scheduleRulesSync(): Promise<void> {
    if (await this.backgroundTasks.isRegistered(RULES_SYNC_TASK_NAME)) return
    await this.backgroundTasks.register(RULES_SYNC_TASK_NAME, RULES_SYNC_INTERVAL_MINUTES)
  }

  async cancelRulesSync(): Promise<void> {
    if (!(await this.backgroundTasks.isRegistered(RULES_SYNC_TASK_NAME))) return
    await this.backgroundTasks.unregister(RULES_SYNC_TASK_NAME)
  }
}
