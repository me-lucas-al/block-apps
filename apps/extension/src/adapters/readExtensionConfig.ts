export type ExtensionConfig = {
  readonly apiUrl: string
  readonly cognitoUserPoolId: string
  readonly cognitoClientId: string
  readonly cognitoHostedDomain: string
}

export function readExtensionConfig(): ExtensionConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL ?? 'https://i51vicajy2.execute-api.sa-east-1.amazonaws.com',
    cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? 'sa-east-1_Xs9lFCHn5',
    cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '4neoq0m9ihqped2jgv5lbnu4kn',
    cognitoHostedDomain:
      import.meta.env.VITE_COGNITO_HOSTED_DOMAIN ??
      'block-apps-auth-090082365159.auth.sa-east-1.amazoncognito.com',
  }
}
