import { createCognitoAuthenticator } from '../../src/auth/cognito/createCognitoAuthenticator'
import { WebPkceCrypto } from '../../src/auth/pkce/WebPkceCrypto'
import { LocalUserSession } from '../../src/auth/session/LocalUserSession'
import { MemorySessionStorage } from '../../src/auth/storage/MemorySessionStorage'

export function buildCognitoAuthenticatorForTest() {
  const storage = new MemorySessionStorage()
  const authenticator = createCognitoAuthenticator(
    { userPoolId: 'pool-1', clientId: 'client-1', hostedDomain: 'auth.example.com' },
    storage,
    new LocalUserSession(storage),
    new WebPkceCrypto(),
  )
  return { authenticator, storage }
}
