import type { Context } from 'hono'
import { ValidationError } from '../../../domain/errors/ValidationError'
import { readRecord } from '../fields/readRecord'

export async function readJsonBody(context: Context): Promise<Record<string, unknown>> {
  const body: unknown = await context.req.json().catch(() => {
    throw new ValidationError('body must be valid JSON')
  })
  return readRecord(body, 'body')
}
