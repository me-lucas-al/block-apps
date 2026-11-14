import { ApiError } from './client/ApiError'

const RULE_QUOTA_EXCEEDED_CODE = 'rule-quota-exceeded'
const UNEXPECTED_FAILURE_MESSAGE = 'Erro inesperado'

function readRuleQuotaLimit(details: unknown): number | null | undefined {
  if (typeof details !== 'object' || details === null) return undefined
  if (!('code' in details) || details.code !== RULE_QUOTA_EXCEEDED_CODE) return undefined
  if (!('maxRulesPerUser' in details)) return null
  return typeof details.maxRulesPerUser === 'number' ? details.maxRulesPerUser : null
}

function describeRuleQuotaExceeded(limit: number | null): string {
  if (limit === null) return 'Você atingiu o limite de regras.'
  return `Você atingiu o limite de ${limit} regras.`
}

export function describeApiFailure(failure: unknown): string {
  if (failure instanceof ApiError) {
    const ruleQuotaLimit = readRuleQuotaLimit(failure.details)
    if (ruleQuotaLimit !== undefined) return describeRuleQuotaExceeded(ruleQuotaLimit)
  }
  return failure instanceof Error ? failure.message : UNEXPECTED_FAILURE_MESSAGE
}
