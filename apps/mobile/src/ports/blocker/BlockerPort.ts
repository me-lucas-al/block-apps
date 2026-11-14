import type { BlockRule } from '@block-apps/core'

export interface BlockerPort {
  applyRules(rules: readonly BlockRule[]): void
}
