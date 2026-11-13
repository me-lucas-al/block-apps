import type { CognitoUserSession } from 'amazon-cognito-identity-js'

export type SignInCallbacks = {
  onSuccess(session: CognitoUserSession): void
  onFailure(error: unknown): void
  newPasswordRequired(): void
  totpRequired(): void
  mfaSetup(): void
}

export type SecretCodeCallbacks = {
  associateSecretCode(secretCode: string): void
  onFailure(error: unknown): void
}

export type SignInScenario = (callbacks: SignInCallbacks) => void

export const sdkScenario: { current: SignInScenario; signOutCount: number } = {
  current: () => undefined,
  signOutCount: 0,
}

export function buildCognitoSession(tokens: {
  accessToken: string
  idToken: string
  refreshToken: string
}): CognitoUserSession {
  return {
    getAccessToken: () => ({ getJwtToken: () => tokens.accessToken }),
    getIdToken: () => ({ getJwtToken: () => tokens.idToken }),
    getRefreshToken: () => ({ getToken: () => tokens.refreshToken }),
  } as unknown as CognitoUserSession
}

export class FakeCognitoUser {
  authenticateUser(_details: unknown, callbacks: SignInCallbacks): void {
    sdkScenario.current(callbacks)
  }

  signOut(): void {
    sdkScenario.signOutCount += 1
  }

  associateSoftwareToken(callbacks: SecretCodeCallbacks): void {
    callbacks.associateSecretCode('SECRET-CODE')
  }
}
