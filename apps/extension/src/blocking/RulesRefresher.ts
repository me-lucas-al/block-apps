import type { BlockRuleRepository, PendingRuleChangeRepository } from '@block-apps/api'
import type { RuleCache } from '../ports/data/RuleCache'
import type { SessionGate } from '../ports/data/SessionGate'

export type BlockingEnforcer = {
  sync(): Promise<void>
}

export type RulesRefresherDependencies = {
  readonly ruleRepository: Pick<BlockRuleRepository, 'list'>
  readonly pendingRuleChanges: Pick<PendingRuleChangeRepository, 'applyDueChanges'>
  readonly ruleCache: RuleCache
  readonly sessionGate: SessionGate
  readonly enforcer: BlockingEnforcer
}

export class RulesRefresher {
  constructor(private readonly dependencies: RulesRefresherDependencies) {}

  async refresh(): Promise<void> {
    const { ruleRepository, pendingRuleChanges, ruleCache, sessionGate, enforcer } = this.dependencies
    try {
      if (await sessionGate.hasSession()) {
        await pendingRuleChanges.applyDueChanges()
        await ruleCache.save(await ruleRepository.list())
      }
    } finally {
      await enforcer.sync()
    }
  }
}
