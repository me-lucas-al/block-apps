import type {
  BlockRuleRepository,
  PendingRuleChangeRepository,
  ServerClock,
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
  readonly userSession: Pick<UserSession, 'currentUserId'>
  readonly serverClock: ServerClock
  readonly blocker: BlockerPort
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  push(
    rules: readonly BlockRule[],
    pendingChanges: readonly PendingRuleChange[],
    accountId: string,
  ): void {
    const { blocker, serverClock } = this.dependencies
    blocker.applyRules({
      rules,
      pendingChanges,
      accountId,
      serverNowIso: serverClock.lastServerTimeIso(),
    })
  }

  async sync(): Promise<void> {
    const { ruleRepository, pendingRuleChanges, userSession } = this.dependencies
    const accountId = await userSession.currentUserId()
    if (!accountId) return

    await pendingRuleChanges.applyDueChanges().catch(() => undefined)
    const rules = await ruleRepository.list()
    const pendingChanges = await pendingRuleChanges.listPendingChanges()
    this.push(rules, pendingChanges, accountId)
  }
}
