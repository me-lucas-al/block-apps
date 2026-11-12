import type { BlockRuleRepository } from '@block-apps/api'
import type { RuleCache } from '../ports/data/RuleCache'
import type { SessionGate } from '../ports/data/SessionGate'

export type BlockingEnforcer = {
  sync(): Promise<void>
}

export type RulesRefresherDependencies = {
  readonly repository: BlockRuleRepository
  readonly ruleCache: RuleCache
  readonly sessionGate: SessionGate
  readonly enforcer: BlockingEnforcer
}

export class RulesRefresher {
  constructor(private readonly dependencies: RulesRefresherDependencies) {}

  async refresh(): Promise<void> {
    const { repository, ruleCache, sessionGate, enforcer } = this.dependencies
    try {
      if (await sessionGate.hasSession()) {
        await ruleCache.save(await repository.list())
      }
    } finally {
      await enforcer.sync()
    }
  }
}
