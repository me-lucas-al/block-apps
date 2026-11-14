import type { RulesSnapshot } from './RulesSnapshot'

export interface BlockerPort {
  applyRules(snapshot: RulesSnapshot): void
  refreshEnforcement(): void
  markAppOpened(): void
}
