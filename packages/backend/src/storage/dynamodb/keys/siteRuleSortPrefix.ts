import { buildRuleId } from '@block-apps/core'
import { ruleSortKey } from './sortKeys'

export const SITE_RULE_SORT_PREFIX = ruleSortKey(buildRuleId('site', ''))
