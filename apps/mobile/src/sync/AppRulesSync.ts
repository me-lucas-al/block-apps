import type {
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import type { BlockRule } from '@block-apps/core'
import type { AppBlockerPort } from '../ports/AppBlockerPort'
import { toNativeRulesJson } from './toNativeRulesJson'

export type AppRulesSyncDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'list'>
  readonly pendingRuleChanges: Pick<PendingRuleChangeRepository, 'applyDueChanges'>
  readonly userSession: Pick<UserSession, 'currentUserEmail'>
  readonly blocker: Pick<AppBlockerPort, 'setRules'>
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  push(rules: readonly BlockRule[]): void {
    this.dependencies.blocker.setRules(toNativeRulesJson(rules))
  }

  async sync(): Promise<void> {
    const { ruleRepository, pendingRuleChanges, userSession } = this.dependencies
    if (!(await userSession.currentUserEmail())) return

    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    this.push(await ruleRepository.list())
  }
}
