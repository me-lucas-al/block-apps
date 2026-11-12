import { CognitoOAuthFlow, type Authenticator } from '@block-apps/api'
import { readExtensionConfig } from '../../readExtensionConfig'

export async function launchExtensionGoogleAuth(authenticator: Authenticator): Promise<void> {
  const config = readExtensionConfig()
  const flow = new CognitoOAuthFlow({
    userPoolId: config.cognitoUserPoolId,
    clientId: config.cognitoClientId,
    hostedDomain: config.cognitoHostedDomain,
  })

  const redirectUri = chrome.identity.getRedirectURL()
  const authUrl = await flow.buildGoogleAuthorizeUrl(redirectUri)

  const responseUrl = await new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (callbackUrl) => {
      if (chrome.runtime.lastError || !callbackUrl) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'OAuth flow failed'))
        return
      }
      resolve(callbackUrl)
    })
  })

  const url = new URL(responseUrl)
  const code = url.searchParams.get('code')
  if (!code) throw new Error('Authorization code missing in OAuth response')

  await authenticator.exchangeOAuthCode?.(code, undefined, redirectUri)
}
