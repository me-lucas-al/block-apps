import { ValidationError } from '../../../domain/errors/ValidationError'
import type { RuleChangeContent } from '../../../domain/rules/ensureValidRuleContent'
import { parseTimeWindows } from './parseTimeWindows'

export function parseRuleContent(body: Record<string, unknown>): RuleChangeContent {
  const mode = body['mode']
  if (mode !== 'always' && mode !== 'schedule') {
    throw new ValidationError('mode must be always or schedule')
  }
  return { mode, windows: parseTimeWindows(body['windows']) }
}
