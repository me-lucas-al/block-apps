import {
  createCognitoAuthenticator,
  HttpApiClient,
  HttpBlockRuleRepository,
  HttpDeviceRepository,
  HttpPendingRuleChangeRepository,
  LocalUserSession,
} from '@block-apps/api'
import { ExpoPkceCrypto } from './auth/ExpoPkceCrypto'
import { readMobileConfig } from './readMobileConfig'
import { SecureSessionStorage } from './secure-store/SecureSessionStorage'

export function createMobileServices() {
  const config = readMobileConfig()
  const storage = new SecureSessionStorage()
  const session = new LocalUserSession(storage)

  const authenticator = createCognitoAuthenticator(
    {
      userPoolId: config.cognitoUserPoolId,
      clientId: config.cognitoClientId,
      hostedDomain: config.cognitoHostedDomain,
    },
    storage,
    session,
    new ExpoPkceCrypto(),
  )

  const http = new HttpApiClient({
    baseUrl: config.apiUrl,
    getToken: async () => session.currentIdToken(),
    onUnauthorized: async () => {
      const refreshed = await authenticator.refreshSession()
      return refreshed?.idToken ?? null
    },
  })

  return {
    storage,
    session,
    authenticator,
    http,
    ruleRepository: new HttpBlockRuleRepository(http),
    pendingRuleChanges: new HttpPendingRuleChangeRepository(http),
    deviceRepository: new HttpDeviceRepository(http),
  }
}
