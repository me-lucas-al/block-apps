import { CognitoChallengeResolver } from '../../../src/auth/cognito/CognitoChallengeResolver'
import { CognitoSrpAuth } from '../../../src/auth/cognito/CognitoSrpAuth'
import { challengedEmail, testCognitoConfig } from './cognitoTestFixtures'
import { scriptCognitoUser } from './FakeCognitoUser'
import type { SignInCallbacks } from './signInChallengeRaisers'

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
