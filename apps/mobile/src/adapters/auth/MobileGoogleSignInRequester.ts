import type { Authenticator } from '@block-apps/api'
import type { GoogleSignInRequester } from '../../ports/GoogleSignInRequester'
import { launchMobileGoogleAuth } from './mobileGoogleAuth'

export class MobileGoogleSignInRequester implements GoogleSignInRequester {
  constructor(private readonly authenticator: Authenticator) {}

  requestGoogleSignIn(): Promise<void> {
    return launchMobileGoogleAuth(this.authenticator)
  }
}
