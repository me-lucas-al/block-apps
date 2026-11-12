import type { ApiEnv } from '../http/app/ApiEnv'

const DEV_TOKEN = /^Bearer dev:([^:\s]+):(\S*)$/

export function buildLocalBindings(authorization: string | null): ApiEnv['Bindings'] {
  const match = authorization?.match(DEV_TOKEN)
  const groups = (match?.[2] ?? '').split(',').filter((group) => group.length > 0)
  const claims = match
    ? { sub: match[1], 'cognito:groups': `[${groups.join(' ')}]` }
    : {}
  const event = { requestContext: { authorizer: { jwt: { claims, scopes: null } } } }
  return { event: event as unknown as ApiEnv['Bindings']['event'] }
}
