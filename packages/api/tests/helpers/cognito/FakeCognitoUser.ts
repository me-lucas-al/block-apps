import type { CognitoUser } from 'amazon-cognito-identity-js'

type ScriptedMethodName =
  | 'authenticateUser'
  | 'completeNewPasswordChallenge'
  | 'sendMFACode'
  | 'associateSoftwareToken'
  | 'verifySoftwareToken'
  | 'setUserMfaPreference'

export type CognitoUserScript = { [Name in ScriptedMethodName]?: CognitoUser[Name] }

let activeScript: CognitoUserScript = {}

export function scriptCognitoUser(script: CognitoUserScript): void {
  activeScript = { ...activeScript, ...script }
}

export function resetCognitoUserScript(): void {
  activeScript = {}
}

function requireScripted<Name extends ScriptedMethodName>(
  name: Name,
): NonNullable<CognitoUserScript[Name]> {
  const scripted = activeScript[name]
  if (!scripted) throw new Error(`FakeCognitoUser.${name} was not scripted`)
  return scripted
}

export class FakeCognitoUser {
  authenticateUser(...args: Parameters<CognitoUser['authenticateUser']>): void {
    requireScripted('authenticateUser')(...args)
  }

  completeNewPasswordChallenge(
    ...args: Parameters<CognitoUser['completeNewPasswordChallenge']>
  ): void {
    requireScripted('completeNewPasswordChallenge')(...args)
  }

  sendMFACode(...args: Parameters<CognitoUser['sendMFACode']>): void {
    requireScripted('sendMFACode')(...args)
  }

  associateSoftwareToken(...args: Parameters<CognitoUser['associateSoftwareToken']>): void {
    requireScripted('associateSoftwareToken')(...args)
  }

  verifySoftwareToken(...args: Parameters<CognitoUser['verifySoftwareToken']>): void {
    requireScripted('verifySoftwareToken')(...args)
  }

  setUserMfaPreference(...args: Parameters<CognitoUser['setUserMfaPreference']>): void {
    requireScripted('setUserMfaPreference')(...args)
  }
}
