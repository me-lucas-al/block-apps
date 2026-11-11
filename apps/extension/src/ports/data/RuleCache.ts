import type { BlockRule } from '@block-apps/core'

export interface RuleCache {
  load(): Promise<BlockRule[]>
  save(rules: readonly BlockRule[]): Promise<void>
}
