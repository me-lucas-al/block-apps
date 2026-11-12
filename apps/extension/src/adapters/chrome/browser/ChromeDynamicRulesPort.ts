import type {
  DynamicRulesPort,
  RedirectRule,
} from '../../../ports/browser/DynamicRulesPort'

export class ChromeDynamicRulesPort implements DynamicRulesPort {
  async listIds(): Promise<number[]> {
    const rules = await chrome.declarativeNetRequest.getDynamicRules()
    return rules.map((rule) => rule.id)
  }

  async replace(
    removeIds: readonly number[],
    addRules: readonly RedirectRule[],
  ): Promise<void> {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [...removeIds],
      addRules: addRules as unknown as chrome.declarativeNetRequest.Rule[],
    })
  }
}
