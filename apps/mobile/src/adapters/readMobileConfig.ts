export type MobileConfig = {
  readonly apiUrl: string
  readonly cognitoUserPoolId: string
  readonly cognitoClientId: string
  readonly cognitoHostedDomain: string
}

export function readMobileConfig(): MobileConfig {
  return {
    apiUrl:
      process.env.EXPO_PUBLIC_API_URL ??
      'https://i51vicajy2.execute-api.sa-east-1.amazonaws.com',
    cognitoUserPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? 'sa-east-1_Xs9lFCHn5',
    cognitoClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '4neoq0m9ihqped2jgv5lbnu4kn',
    cognitoHostedDomain:
      process.env.EXPO_PUBLIC_COGNITO_HOSTED_DOMAIN ??
      'block-apps-auth-090082365159.auth.sa-east-1.amazoncognito.com',
  }
}
