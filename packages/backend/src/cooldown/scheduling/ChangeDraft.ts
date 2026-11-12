import type { PendingRuleChange } from '@block-apps/core'

export type ChangeDraft = Pick<PendingRuleChange, 'kind' | 'mode' | 'windows'>
