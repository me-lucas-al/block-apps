import type { Authenticator } from './Authenticator'
import { SessionRevocationError } from './SessionRevocationError'

export const SESSION_NOT_REVOKED_NOTICE =
  'Sessão encerrada neste aparelho; não foi possível invalidar o token no servidor.'

export type SignOutOutcome =
  | { readonly revokedOnServer: true }
  | { readonly revokedOnServer: false; readonly notice: string }

function buildUnexpectedFailureNotice(failure: unknown): string {
  const reason = failure instanceof Error ? failure.message : 'erro desconhecido'
  return `Não foi possível concluir o logout: ${reason}`
}

export class SignOutUseCase {
  constructor(private readonly authenticator: Authenticator) {}

  async signOut(): Promise<SignOutOutcome> {
    try {
      await this.authenticator.signOut()
      return { revokedOnServer: true }
    } catch (failure) {
      const notice =
        failure instanceof SessionRevocationError
          ? SESSION_NOT_REVOKED_NOTICE
          : buildUnexpectedFailureNotice(failure)
      return { revokedOnServer: false, notice }
    }
  }
}
