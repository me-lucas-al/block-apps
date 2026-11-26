import { ValidationError } from '../../../domain/errors/ValidationError'

export type DnsProfileBody = { readonly timeZone: string }

export function parseDnsProfileBody(body: Record<string, unknown>): DnsProfileBody {
  const timeZone = body['timeZone']
  if (typeof timeZone !== 'string' || timeZone.trim().length === 0) {
    throw new ValidationError('timeZone is required')
  }
  return { timeZone: timeZone.trim() }
}
