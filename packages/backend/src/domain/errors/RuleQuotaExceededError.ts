export class RuleQuotaExceededError extends Error {
  constructor(readonly maxRulesPerUser: number) {
    super(`rule limit of ${maxRulesPerUser} reached`)
    this.name = 'RuleQuotaExceededError'
  }
}
