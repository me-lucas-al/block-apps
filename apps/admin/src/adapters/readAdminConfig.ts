import { requireConfigValue } from '@block-apps/api'

export type AdminConfig = {
  readonly apiUrl: string
  readonly cognitoUserPoolId: string
  readonly cognitoClientId: string
  readonly cognitoHostedDomain: string
}

export function readAdminConfig(): AdminConfig {
  return {
    apiUrl: requireConfigValue('VITE_API_URL', import.meta.env.VITE_API_URL),
    cognitoUserPoolId: requireConfigValue(
      'VITE_COGNITO_USER_POOL_ID',
      import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ),
    cognitoClientId: requireConfigValue(
      'VITE_COGNITO_CLIENT_ID',
      import.meta.env.VITE_COGNITO_CLIENT_ID,
    ),
    cognitoHostedDomain: requireConfigValue(
      'VITE_COGNITO_HOSTED_DOMAIN',
      import.meta.env.VITE_COGNITO_HOSTED_DOMAIN,
    ),
  }
}
