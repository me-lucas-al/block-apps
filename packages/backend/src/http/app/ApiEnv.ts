import type { APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'
import type { AuthenticatedUser } from '../auth/AuthenticatedUser'

export type ApiEnv = {
  Bindings: { event: APIGatewayProxyEventV2WithJWTAuthorizer }
  Variables: { user: AuthenticatedUser }
}
