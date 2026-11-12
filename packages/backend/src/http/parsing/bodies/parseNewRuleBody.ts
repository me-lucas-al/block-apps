import { ValidationError } from '../../../domain/errors/ValidationError'
import type { NewBlockRuleInput } from '../../../rules/use-cases/CreateBlockRuleUseCase'
import { readTextField } from '../fields/readTextField'
import { parseRuleContent } from './parseRuleContent'

export function parseNewRuleBody(body: Record<string, unknown>): NewBlockRuleInput {
  const targetType = body['targetType']
  if (targetType !== 'app' && targetType !== 'site' && targetType !== 'keyword') {
    throw new ValidationError('targetType must be app, site or keyword')
  }
  return { ...parseRuleContent(body), targetType, target: readTextField(body, 'target') }
}
