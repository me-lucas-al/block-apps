import type {
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import type { BlockRule } from '@block-apps/core'
import type { BlockerPort } from '../ports/blocker/BlockerPort'

export type AppRulesSyncDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'list'>
  readonly pendingRuleChanges: Pick<PendingRuleChangeRepository, 'applyDueChanges'>
  readonly userSession: Pick<UserSession, 'currentUserEmail'>
  readonly blocker: BlockerPort
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  push(rules: readonly BlockRule[]): void {
    this.dependencies.blocker.applyRules(rules)
  }

  async sync(): Promise<void> {
    const { ruleRepository, pendingRuleChanges, userSession } = this.dependencies
    if (!(await userSession.currentUserEmail())) return

    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    this.push(await ruleRepository.list())
  }
}
