import type { CognitoUserSession } from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'

export function extractSessionTokens(session: CognitoUserSession, email: string): SessionTokens {
  return {
    accessToken: session.getAccessToken().getJwtToken(),
    idToken: session.getIdToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
    email,
  }
}
