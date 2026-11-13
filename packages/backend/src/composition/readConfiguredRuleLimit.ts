import { readMaxRulesPerUser } from '../rules/quota/readMaxRulesPerUser'

export function readConfiguredRuleLimit(environment: NodeJS.ProcessEnv): number {
  try {
    return readMaxRulesPerUser(environment)
  } catch (failure: unknown) {
    const detail = failure instanceof Error ? failure.message : 'unknown failure'
    console.error(JSON.stringify({ message: 'invalid rule limit configuration', detail }))
    throw failure
  }
}
