import type { AppRuleError } from './buildAppRule'

const MESSAGES: Record<AppRuleError, string> = {
  'no-app': 'Escolha um app.',
  'no-windows': 'Adicione ao menos um horário permitido.',
  'no-days': 'Selecione ao menos um dia em cada horário.',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30.',
}

export function ruleErrorMessage(error: AppRuleError): string {
  return MESSAGES[error]
}
