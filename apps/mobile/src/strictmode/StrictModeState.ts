import type { PendingRuleChange } from '@block-apps/core'

export type StrictModeState =
  | { readonly status: 'off' }
  | { readonly status: 'on' }
  | { readonly status: 'turningOff'; readonly removal: PendingRuleChange }
