import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  type CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'
import type { SessionTokens } from '../contracts/SessionTokens'

export function createSignedInUser(userPool: CognitoUserPool, tokens: SessionTokens): CognitoUser {
  const user = new CognitoUser({ Username: tokens.email, Pool: userPool })
  user.setSignInUserSession(
    new CognitoUserSession({
      IdToken: new CognitoIdToken({ IdToken: tokens.idToken }),
      AccessToken: new CognitoAccessToken({ AccessToken: tokens.accessToken }),
      RefreshToken: new CognitoRefreshToken({ RefreshToken: tokens.refreshToken }),
    }),
  )
  return user
}
