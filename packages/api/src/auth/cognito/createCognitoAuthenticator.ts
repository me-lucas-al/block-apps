import type { SessionStorage } from '../contracts/SessionStorage'
import type { PkceCrypto } from '../pkce/PkceCrypto'
import type { LocalUserSession } from '../session/LocalUserSession'
import { CognitoAccountOps } from './CognitoAccountOps'
import { CognitoAuthenticator } from './CognitoAuthenticator'
import { CognitoChallengeResolver } from './CognitoChallengeResolver'
import type { CognitoConfig } from './CognitoConfig'
import { CognitoOAuthFlow } from './CognitoOAuthFlow'
import { CognitoPasswordChange } from './CognitoPasswordChange'
import { CognitoSessionManager } from './CognitoSessionManager'
import { CognitoSrpAuth } from './CognitoSrpAuth'
import { CognitoTokenRevoker } from './CognitoTokenRevoker'
import { CognitoTotpEnrollment } from './CognitoTotpEnrollment'

export function createCognitoAuthenticator(
  config: CognitoConfig,
  storage: SessionStorage,
  session: LocalUserSession,
  pkceCrypto: PkceCrypto,
): CognitoAuthenticator {
  const srpAuth = new CognitoSrpAuth(config)
  const accountOps = new CognitoAccountOps(config)
  return new CognitoAuthenticator({
    srpAuth,
    accountOps,
    challengeResolver: new CognitoChallengeResolver(srpAuth),
    oauthFlow: new CognitoOAuthFlow(config, pkceCrypto),
    sessionManager: new CognitoSessionManager(
      storage,
      session,
      accountOps,
      new CognitoTokenRevoker(config),
    ),
    totpEnrollment: new CognitoTotpEnrollment(config),
    passwordChange: new CognitoPasswordChange(config),
  })
}
