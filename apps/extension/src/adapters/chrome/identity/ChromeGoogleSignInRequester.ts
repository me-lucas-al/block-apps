import type { LocalUserSession } from '@block-apps/api'
import type { GoogleSignInRequester } from '../../../ports/browser/GoogleSignInRequester'
import { GOOGLE_SIGN_IN_MESSAGE, type GoogleSignInReply } from '../../../shared/messages'

export class ChromeGoogleSignInRequester implements GoogleSignInRequester {
  constructor(private readonly session: LocalUserSession) {}

  async requestGoogleSignIn(): Promise<void> {
    const reply: GoogleSignInReply | undefined = await chrome.runtime.sendMessage({
      type: GOOGLE_SIGN_IN_MESSAGE,
    })
    if (!reply) throw new Error('O serviço em segundo plano não respondeu ao login com Google')
    if (!reply.ok) throw new Error(reply.error)
    await this.session.reloadFromStorage()
  }
}
