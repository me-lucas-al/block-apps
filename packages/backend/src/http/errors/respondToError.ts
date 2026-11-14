import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { ConflictError } from '../../domain/errors/ConflictError'
import { ForbiddenError } from '../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../domain/errors/NotFoundError'
import { RuleQuotaExceededError } from '../../domain/errors/RuleQuotaExceededError'
import { ValidationError } from '../../domain/errors/ValidationError'

function pickStatus(error: Error): ContentfulStatusCode {
  if (error instanceof ValidationError) return 400
  if (error instanceof ForbiddenError) return 403
  if (error instanceof NotFoundError) return 404
  if (error instanceof ConflictError) return 409
  return 500
}

export function respondToError(error: Error, context: Context) {
  if (error instanceof HTTPException) return error.getResponse()
  if (error instanceof RuleQuotaExceededError) {
    return context.json(
      { error: error.message, code: 'rule-quota-exceeded', maxRulesPerUser: error.maxRulesPerUser },
      422,
    )
  }
  const status = pickStatus(error)
  if (status === 500) {
    console.error(JSON.stringify({ message: 'unhandled error', name: error.name, detail: error.message }))
    return context.json({ error: 'internal error' }, 500)
  }
  return context.json({ error: error.message }, status)
}
