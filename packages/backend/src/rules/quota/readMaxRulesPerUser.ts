export const DEFAULT_MAX_RULES_PER_USER = 200

const POSITIVE_DECIMAL_INTEGER = /^\d+$/

export function readMaxRulesPerUser(environment: NodeJS.ProcessEnv): number {
  const configured = environment.MAX_RULES_PER_USER
  if (configured === undefined || configured === '') return DEFAULT_MAX_RULES_PER_USER
  const limit = Number(configured)
  if (!POSITIVE_DECIMAL_INTEGER.test(configured) || !Number.isSafeInteger(limit) || limit < 1) {
    throw new Error(`MAX_RULES_PER_USER must be a positive integer, received "${configured}"`)
  }
  return limit
}
