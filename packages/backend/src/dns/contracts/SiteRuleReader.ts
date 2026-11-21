import type { BlockRule } from '@block-apps/core'

export interface SiteRuleReader {
  listSiteRulesByUser(userId: string): Promise<BlockRule[]>
}
