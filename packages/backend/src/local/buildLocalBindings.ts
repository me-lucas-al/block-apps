import type { ApiEnv } from '../http/app/ApiEnv'

export const LOCAL_ADMIN_CLIENT_ID = 'local-admin-client'

const DEV_TOKEN = /^Bearer dev:([^:\s]+):(\S*)$/

export function buildLocalBindings(authorization: string | null): ApiEnv['Bindings'] {
  const match = authorization?.match(DEV_TOKEN)
  const groups = (match?.[2] ?? '').split(',').filter((group) => group.length > 0)
  const claims = match
    ? { sub: match[1], aud: LOCAL_ADMIN_CLIENT_ID, 'cognito:groups': `[${groups.join(' ')}]` }
    : {}
  const event = { requestContext: { authorizer: { jwt: { claims, scopes: null } } } }
  return { event: event as unknown as ApiEnv['Bindings']['event'] }
}
