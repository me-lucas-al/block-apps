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
  readonly userSession: Pick<UserSession, 'currentUserId' | 'currentUserEmail'>
  readonly serverClock: ServerClock
  readonly blocker: BlockerPort
}

export class AppRulesSync {
  constructor(private readonly dependencies: AppRulesSyncDependencies) {}

  async push(
    rules: readonly BlockRule[],
    pendingChanges: readonly PendingRuleChange[],
    accountId: string,
  ): Promise<void> {
    const { blocker, serverClock, userSession } = this.dependencies
    const accountEmail = await userSession.currentUserEmail().catch(() => null)
    await blocker.applyRules({
      rules,
      pendingChanges,
      accountId,
      legacyAccountId: accountEmail?.trim().toLowerCase() ?? null,
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
    await this.push(rules, pendingChanges, accountId)
  }
}
