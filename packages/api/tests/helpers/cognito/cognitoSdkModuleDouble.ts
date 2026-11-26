import { vi } from 'vitest'
import { FakeCognitoUser } from './FakeCognitoUser'

export async function buildCognitoSdkModuleDouble(): Promise<typeof import('amazon-cognito-identity-js')> {
  const actualSdk = await vi.importActual<typeof import('amazon-cognito-identity-js')>(
    'amazon-cognito-identity-js',
  )
  return {
    ...actualSdk,
    CognitoUser: FakeCognitoUser as unknown as typeof actualSdk.CognitoUser,
  }
}
