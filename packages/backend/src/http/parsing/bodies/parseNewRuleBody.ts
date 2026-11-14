import { isTargetType } from '@block-apps/core'
import { ValidationError } from '../../../domain/errors/ValidationError'
import type { NewBlockRuleInput } from '../../../rules/use-cases/CreateBlockRuleUseCase'
import { readTextField } from '../fields/readTextField'
import { parseRuleContent } from './parseRuleContent'

export function parseNewRuleBody(body: Record<string, unknown>): NewBlockRuleInput {
  const targetType = body['targetType']
  if (!isTargetType(targetType)) {
    throw new ValidationError(
      'targetType must be app, site, keyword, iosSelection or protection',
    )
  }
  return { ...parseRuleContent(body), targetType, target: readTextField(body, 'target') }
}
