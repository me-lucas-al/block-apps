import type { CognitoUser } from 'amazon-cognito-identity-js'
import { CognitoChallengeResolver } from '../../../src/auth/cognito/CognitoChallengeResolver'
import { CognitoSrpAuth } from '../../../src/auth/cognito/CognitoSrpAuth'
import { scriptCognitoUser } from './FakeCognitoUser'

export const testCognitoConfig = { userPoolId: 'us-east-1_testpool', clientId: 'client-1' }
export const challengedEmail = 'user@example.com'

type SignInCallbacks = Parameters<CognitoUser['authenticateUser']>[1]

export type PendingChallenge = {
  readonly srpAuth: CognitoSrpAuth
  readonly challengeResolver: CognitoChallengeResolver
}

export async function startPendingChallenge(
  raiseChallenge: (callbacks: SignInCallbacks) => void,
): Promise<PendingChallenge> {
  scriptCognitoUser({ authenticateUser: (_details, callbacks) => raiseChallenge(callbacks) })
  const srpAuth = new CognitoSrpAuth(testCognitoConfig)
  await srpAuth.authenticate(challengedEmail, 'password-1')
  return { srpAuth, challengeResolver: new CognitoChallengeResolver(srpAuth) }
}

export function raiseNewPasswordChallenge(callbacks: SignInCallbacks): void {
  callbacks.newPasswordRequired?.({}, {})
}

export function raiseTotpChallenge(callbacks: SignInCallbacks): void {
  callbacks.totpRequired?.('SOFTWARE_TOKEN_MFA', {})
}
