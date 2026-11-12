import { type BlockRule, isBlockedNow, normalizeSiteTarget } from '@block-apps/core'
import type { RedirectRule } from '../ports/browser/DynamicRulesPort'

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

function readBlockedSiteHost(rule: BlockRule, now: Date): string | null {
  if (rule.targetType !== 'site' || !isBlockedNow(rule, now)) return null
  return normalizeSiteTarget(rule.target)
}

export function buildRedirectRules(
  rules: readonly BlockRule[],
  now: Date,
): RedirectRule[] {
  const blockedHosts = rules
    .map((rule) => readBlockedSiteHost(rule, now))
    .filter((host): host is string => host !== null)
  const uniqueHosts = [...new Set(blockedHosts)]
  return uniqueHosts.map((host, index) => toRedirectRule(host, index + 1))
}
