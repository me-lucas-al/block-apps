export type PreSignUpTriggerEvent = {
  triggerSource: string
  userPoolId: string
  userName: string
  request: {
    userAttributes: Record<string, string | undefined>
  }
  response: {
    autoConfirmUser?: boolean
    autoVerifyEmail?: boolean
  }
}
