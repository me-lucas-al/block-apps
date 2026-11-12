import type { ApiEnv } from '../../src/http/app/ApiEnv'

export function buildLambdaBindings(
  userId: string | null,
  groups: string[] = [],
): ApiEnv['Bindings'] {
  const claims = userId ? { sub: userId, 'cognito:groups': `[${groups.join(' ')}]` } : {}
  const event = { requestContext: { authorizer: { jwt: { claims, scopes: null } } } }
  return { event: event as unknown as ApiEnv['Bindings']['event'] }
}
