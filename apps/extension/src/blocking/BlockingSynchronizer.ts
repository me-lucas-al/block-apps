import type { DynamicRulesPort } from '../ports/browser/DynamicRulesPort'
import type { RuleCache } from '../ports/data/RuleCache'
import { buildRedirectRules } from './buildRedirectRules'

export type OpenTabsEnforcer = {
  blockOpenTabs(blockedHosts: readonly string[]): Promise<void>
}

export type BlockingSynchronizerDependencies = {
  readonly ruleCache: RuleCache
  readonly dynamicRules: DynamicRulesPort
  readonly openTabs: OpenTabsEnforcer
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
    const { ruleCache, dynamicRules, openTabs, now } = this.dependencies
    const rules = await ruleCache.load()
    const desiredRules = buildRedirectRules(rules, now())
    const existingIds = await dynamicRules.listIds()
    await dynamicRules.replace(existingIds, desiredRules)

    const blockedHosts = desiredRules.flatMap((rule) => rule.condition.requestDomains)
    await openTabs.blockOpenTabs(blockedHosts)
  }
}
