import { AdminApiError } from '../adapters/invokeAdminFunction'

const MESSAGES: Record<string, string> = {
  unauthenticated: 'Sua sessão expirou. Entre novamente.',
  forbidden: 'Você não tem permissão de administrador.',
  password_change_required: 'Troque a senha temporária antes de administrar usuários.',
  not_found: 'Usuário não encontrado. A lista foi atualizada.',
  conflict: 'Já existe um usuário com esse e-mail.',
  self_action: 'Você não pode excluir nem rebaixar a própria conta.',
  last_admin: 'É preciso manter ao menos um administrador.',
  invalid_input: 'Confira os campos: e-mail válido, senha com 8 a 72 caracteres e, ao promover alguém a administrador, uma nova senha.',
}

export function describeFailure(failure: unknown): string {
  if (failure instanceof AdminApiError) return MESSAGES[failure.code] ?? failure.message
  return failure instanceof Error ? failure.message : 'Erro inesperado'
}
