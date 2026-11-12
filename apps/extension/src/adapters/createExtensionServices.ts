import {
  CognitoAuthenticator,
  HttpApiClient,
  HttpBlockRuleRepository,
  HttpDeviceRepository,
  HttpPendingRuleChangeRepository,
  LocalUserSession,
} from '@block-apps/api'
import { ChromeSessionStorage } from './chrome/storage/ChromeSessionStorage'
import { readExtensionConfig } from './readExtensionConfig'

export function createExtensionServices() {
  const config = readExtensionConfig()
  const storage = new ChromeSessionStorage()
  const session = new LocalUserSession(storage)

  const authenticator = new CognitoAuthenticator(
    {
      userPoolId: config.cognitoUserPoolId,
      clientId: config.cognitoClientId,
      hostedDomain: config.cognitoHostedDomain,
    },
    storage,
    session,
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
