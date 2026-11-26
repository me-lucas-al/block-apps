import type { CognitoUser } from 'amazon-cognito-identity-js'

export type SignInCallbacks = Parameters<CognitoUser['authenticateUser']>[1]

export function raiseNewPasswordChallenge(callbacks: SignInCallbacks): void {
  callbacks.newPasswordRequired?.({}, {})
}

export function raiseTotpChallenge(callbacks: SignInCallbacks): void {
  callbacks.totpRequired?.('SOFTWARE_TOKEN_MFA', {})
}

export function raiseMfaSetupChallenge(callbacks: SignInCallbacks): void {
  callbacks.mfaSetup?.('MFA_SETUP', {})
}
