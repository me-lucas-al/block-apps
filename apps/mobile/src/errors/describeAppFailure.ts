import { describeApiFailure } from '@block-apps/api'

export const NATIVE_FAILURE_MESSAGES: Readonly<Record<string, string>> = {
  ERR_ANOTHER_ACCOUNT_OWNS_RULES:
    'Este aparelho está protegido por outra conta. Entre com a conta original para mudar os bloqueios.',
  ERR_INVALID_RULES: 'As regras recebidas do servidor não puderam ser lidas. Tente sincronizar de novo.',
  ERR_SCHEDULE_REGISTRATION_FAILED:
    'Não foi possível agendar os horários no iPhone. Os apps com horário ficam bloqueados até dar certo.',
  ERR_APP_GROUP_UNAVAILABLE: 'O armazenamento compartilhado do app não está disponível. Reinstale o app.',
  ERR_SELECTION_NOT_SAVED: 'Não foi possível guardar a escolha de apps. Tente escolher de novo.',
  ERR_PICKER_NOT_PRESENTED:
    'Não foi possível abrir a escolha de apps agora. Volte ao app e tente de novo.',
}

function readErrorCode(failure: unknown): string | null {
  if (typeof failure !== 'object' || failure === null) return null
  const code: unknown = Reflect.get(failure, 'code')
  return typeof code === 'string' ? code : null
}

export function describeAppFailure(failure: unknown): string {
  const code = readErrorCode(failure)
  const nativeMessage = code ? NATIVE_FAILURE_MESSAGES[code] : undefined
  return nativeMessage ?? describeApiFailure(failure)
}
