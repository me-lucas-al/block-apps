import type { Context } from 'hono'
import { ValidationError } from '../../../domain/errors/ValidationError'

const MAX_RULE_ID_LENGTH = 300

export function readRuleIdParam(context: Context): string {
  const ruleId = context.req.param('ruleId') ?? ''
  if (ruleId.length === 0 || ruleId.length > MAX_RULE_ID_LENGTH) {
    throw new ValidationError('ruleId has an invalid length')
  }
  return ruleId
}
