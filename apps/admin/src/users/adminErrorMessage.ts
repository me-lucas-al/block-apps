import { ApiError } from '@block-apps/api'

export function describeFailure(failure: unknown): string {
  if (failure instanceof ApiError) {
    if (failure.status === 401) return 'Sua sessão expirou. Entre novamente.'
    if (failure.status === 403) {
      if (/mfa|totp/i.test(failure.message)) {
        return 'Administradores devem ter autenticação em duas etapas (MFA) ativada.'
      }
      if (/temporary/i.test(failure.message)) {
        return 'Troque a senha temporária antes de administrar usuários.'
      }
      return 'Você não tem permissão de administrador.'
    }
    if (failure.status === 404) return 'Usuário não encontrado. A lista foi atualizada.'
    if (failure.status === 409) {
      if (/least one admin/i.test(failure.message)) {
        return 'É preciso manter ao menos um administrador.'
      }
      if (/self/i.test(failure.message)) {
        return 'Você não pode excluir nem rebaixar a própria conta.'
      }
      return 'Já existe um usuário com esse e-mail.'
    }
    if (failure.status === 400) return 'Confira os campos enviados.'
    return failure.message
  }

  return failure instanceof Error ? failure.message : 'Erro inesperado'
}

export function isMfaRequiredFailure(failure: unknown): boolean {
  return failure instanceof ApiError && failure.status === 403 && /mfa|totp/i.test(failure.message)
}
