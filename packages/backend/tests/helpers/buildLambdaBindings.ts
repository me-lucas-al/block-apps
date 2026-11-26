import type { ApiEnv } from '../../src/http/app/ApiEnv'

export const ADMIN_CLIENT_ID = 'admin-client'

export type TokenClaimOverrides = Readonly<Record<string, string>>

export function buildLambdaBindings(
  userId: string | null,
  groups: string[] = [],
  clientClaims: TokenClaimOverrides = { aud: ADMIN_CLIENT_ID },
): ApiEnv['Bindings'] {
  const claims = userId
    ? { sub: userId, 'cognito:groups': `[${groups.join(' ')}]`, ...clientClaims }
    : {}
  const event = { requestContext: { authorizer: { jwt: { claims, scopes: null } } } }
  return { event: event as unknown as ApiEnv['Bindings']['event'] }
}
