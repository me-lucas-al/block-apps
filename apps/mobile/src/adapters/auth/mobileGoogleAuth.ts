import {
  CognitoOAuthHelper,
  generateCodeChallenge,
  generateRandomString,
  type Authenticator,
} from '@block-apps/api'
import { makeRedirectUri } from 'expo-auth-session'
import { maybeCompleteAuthSession, openAuthSessionAsync } from 'expo-web-browser'
import { readMobileConfig } from '../readMobileConfig'

maybeCompleteAuthSession()

export async function launchMobileGoogleAuth(authenticator: Authenticator): Promise<void> {
  const config = readMobileConfig()
  const helper = new CognitoOAuthHelper({
    userPoolId: config.cognitoUserPoolId,
    clientId: config.cognitoClientId,
    hostedDomain: config.cognitoHostedDomain,
  })

  const verifier = generateRandomString(64)
  const challenge = await generateCodeChallenge(verifier)
  const redirectUri = makeRedirectUri({ scheme: 'blockapps', path: 'auth' })
  const authUrl = helper.buildAuthorizeUrl(redirectUri, challenge)

  const result = await openAuthSessionAsync(authUrl, redirectUri)
  if (result.type !== 'success' || !result.url) return

  const url = new URL(result.url)
  const code = url.searchParams.get('code')
  if (!code) throw new Error('Authorization code missing in OAuth response')

  await authenticator.exchangeOAuthCode?.(code, verifier, redirectUri)
}
