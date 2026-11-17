export type InstalledApp = {
  packageName: string
  label: string
}

export type SetRulesRequest = {
  rulesJson: string
  ownerId: string
  pendingRuleIds: string[]
  serverNowIso: string | null
  legacyOwnerId: string | null
}
