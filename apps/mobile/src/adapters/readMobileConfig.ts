import { requireConfigValue } from '@block-apps/api'

export type MobileConfig = {
  readonly apiUrl: string
  readonly cognitoUserPoolId: string
  readonly cognitoClientId: string
  readonly cognitoHostedDomain: string
}

export function readMobileConfig(): MobileConfig {
  return {
    apiUrl: requireConfigValue('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL),
    cognitoUserPoolId: requireConfigValue(
      'EXPO_PUBLIC_COGNITO_USER_POOL_ID',
      process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
    ),
    cognitoClientId: requireConfigValue(
      'EXPO_PUBLIC_COGNITO_CLIENT_ID',
      process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
    ),
    cognitoHostedDomain: requireConfigValue(
      'EXPO_PUBLIC_COGNITO_HOSTED_DOMAIN',
      process.env.EXPO_PUBLIC_COGNITO_HOSTED_DOMAIN,
    ),
  }
}
