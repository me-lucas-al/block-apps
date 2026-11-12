import type { DynamicRulesPort } from '../ports/browser/DynamicRulesPort'
import type { RuleCache } from '../ports/data/RuleCache'
import { buildRedirectRules } from './buildRedirectRules'

export type BlockingSynchronizerDependencies = {
  readonly ruleCache: RuleCache
  readonly dynamicRules: DynamicRulesPort
  readonly now: () => Date
}

export class BlockingSynchronizer {
  private queue: Promise<void> = Promise.resolve()

  constructor(private readonly dependencies: BlockingSynchronizerDependencies) {}

  sync(): Promise<void> {
    const run = () => this.applyCurrentRules()
    this.queue = this.queue.then(run, run)
    return this.queue
  }

  private async applyCurrentRules(): Promise<void> {
    const { ruleCache, dynamicRules, now } = this.dependencies
    const rules = await ruleCache.load()
    const desiredRules = buildRedirectRules(rules, now())
    const existingIds = await dynamicRules.listIds()
    await dynamicRules.replace(existingIds, desiredRules)
  }
}
