import type { GoogleSignInRequester } from '../../../ports/browser/GoogleSignInRequester'
import { GOOGLE_SIGN_IN_MESSAGE, type GoogleSignInReply } from '../../../shared/messages'

const BACKGROUND_UNREACHABLE_MESSAGE =
  'Não foi possível falar com o serviço em segundo plano da extensão. Feche o popup, abra de novo e tente outra vez.'

export class ChromeGoogleSignInRequester implements GoogleSignInRequester {
  async requestGoogleSignIn(): Promise<void> {
    const reply = await this.sendSignInRequest()
    if (!reply) throw new Error(BACKGROUND_UNREACHABLE_MESSAGE)
    if (!reply.ok) throw new Error(reply.error)
  }

  private async sendSignInRequest(): Promise<GoogleSignInReply | undefined> {
    try {
      return await chrome.runtime.sendMessage({ type: GOOGLE_SIGN_IN_MESSAGE })
    } catch {
      throw new Error(BACKGROUND_UNREACHABLE_MESSAGE)
    }
  }
}
