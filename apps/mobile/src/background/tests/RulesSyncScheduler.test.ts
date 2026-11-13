import { describe, expect, it, vi } from 'vitest'
import type { BackgroundTaskPort } from '../BackgroundTaskPort'
import { RulesSyncScheduler } from '../RulesSyncScheduler'
import { RULES_SYNC_INTERVAL_MINUTES, RULES_SYNC_TASK_NAME } from '../rulesSyncTaskConfig'

function buildPort(isRegistered: boolean): BackgroundTaskPort {
  return {
    isRegistered: vi.fn().mockResolvedValue(isRegistered),
    register: vi.fn().mockResolvedValue(undefined),
  }
}

describe('RulesSyncScheduler', () => {
  it('registers the task with the minimum interval when it is not registered', async () => {
    const port = buildPort(false)

    await new RulesSyncScheduler(port).scheduleRulesSync()

    expect(port.register).toHaveBeenCalledWith(RULES_SYNC_TASK_NAME, RULES_SYNC_INTERVAL_MINUTES)
  })

  it('does not register the task twice', async () => {
    const port = buildPort(true)

    await new RulesSyncScheduler(port).scheduleRulesSync()

    expect(port.register).not.toHaveBeenCalled()
  })
})
