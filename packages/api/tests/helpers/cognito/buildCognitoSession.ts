import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js'

export const signedInTokens = {
  accessToken: 'access-jwt',
  idToken: 'id-jwt',
  refreshToken: 'refresh-token',
}

export function buildCognitoSession(): CognitoUserSession {
  return new CognitoUserSession({
    AccessToken: new CognitoAccessToken({ AccessToken: signedInTokens.accessToken }),
    IdToken: new CognitoIdToken({ IdToken: signedInTokens.idToken }),
    RefreshToken: new CognitoRefreshToken({ RefreshToken: signedInTokens.refreshToken }),
  })
}
