import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import type { AuthenticatedUser } from './AuthenticatedUser'
import { readGroupsClaim } from './readGroupsClaim'
import { readTokenClientId } from './readTokenClientId'

export function readAuthenticatedUser(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): AuthenticatedUser | null {
  const claims = event.requestContext.authorizer?.jwt.claims
  const userId = claims?.['sub']
  if (typeof userId !== 'string' || userId.length === 0) return null
  return {
    userId,
    groups: readGroupsClaim(claims?.['cognito:groups']),
    clientId: readTokenClientId(claims),
  }
}
