import { type BlockRule, isBlockedNow } from '@block-apps/core'
import type { RedirectRule } from '../ports/DynamicRulesPort'

const MAIN_FRAME_PRIORITY = 1

function toRedirectRule(host: string, id: number): RedirectRule {
  return {
    id,
    priority: MAIN_FRAME_PRIORITY,
    action: {
      type: 'redirect',
      redirect: { extensionPath: `/blocked.html?site=${encodeURIComponent(host)}` },
    },
    condition: { requestDomains: [host], resourceTypes: ['main_frame'] },
  }
}

export function buildRedirectRules(
  rules: readonly BlockRule[],
  now: Date,
): RedirectRule[] {
  return rules
    .filter((rule) => rule.targetType === 'site' && isBlockedNow(rule, now))
    .map((rule, index) => toRedirectRule(rule.target, index + 1))
}
