import type { BlockRule } from '@block-apps/core'
import type { RuleCache } from '../../ports/RuleCache'

const STORAGE_KEY = 'blockRules'

export class ChromeStorageRuleCache implements RuleCache {
  async load(): Promise<BlockRule[]> {
    const stored = await chrome.storage.local.get(STORAGE_KEY)
    return (stored[STORAGE_KEY] as BlockRule[] | undefined) ?? []
  }

  async save(rules: readonly BlockRule[]): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: rules })
  }
}
