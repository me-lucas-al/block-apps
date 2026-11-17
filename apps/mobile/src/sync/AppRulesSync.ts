import type {
  BlockRuleRepository,
  PendingRuleChangeRepository,
  UserSession,
} from '@block-apps/api'
import type { BlockRule, PendingRuleChange } from '@block-apps/core'
import type { BlockerPort } from '../ports/blocker/BlockerPort'

export type AppRulesSyncDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'list'>
  readonly pendingRuleChanges: Pick<
    PendingRuleChangeRepository,
    'applyDueChanges' | 'listPendingChanges'
  >
  readonly userSession: Pick<UserSession, 'currentUserEmail'>
  readonly blocker: BlockerPort
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  push(rules: readonly BlockRule[], pendingChanges: readonly PendingRuleChange[]): void {
    this.dependencies.blocker.applyRules(rules, pendingChanges)
  }

  async sync(): Promise<void> {
    const { ruleRepository, pendingRuleChanges, userSession } = this.dependencies
    if (!(await userSession.currentUserEmail())) return

    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const rules = await ruleRepository.list()
    const pendingChanges = await pendingRuleChanges.listPendingChanges()
    this.push(rules, pendingChanges)
  }
}
