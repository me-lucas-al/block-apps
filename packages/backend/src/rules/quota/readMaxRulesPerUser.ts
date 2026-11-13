export const DEFAULT_MAX_RULES_PER_USER = 200

export function readMaxRulesPerUser(environment: NodeJS.ProcessEnv): number {
  const configured = environment.MAX_RULES_PER_USER
  if (configured === undefined || configured === '') return DEFAULT_MAX_RULES_PER_USER
  const limit = Number(configured)
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('MAX_RULES_PER_USER must be a positive integer')
  }
  return limit
}
