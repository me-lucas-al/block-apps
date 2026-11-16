import type { RulesSnapshot } from './RulesSnapshot'

export interface BlockerPort {
  applyRules(snapshot: RulesSnapshot): Promise<void>
  refreshEnforcement(): Promise<void>
  markAppOpened(): Promise<void>
}
