import type { BlockRule } from '../blockRule'
import type { PendingRuleChange } from '../pendingRuleChange'

export type RuleUpdateOutcome =
  | { readonly status: 'applied'; readonly rule: BlockRule }
  | { readonly status: 'pending'; readonly change: PendingRuleChange }
