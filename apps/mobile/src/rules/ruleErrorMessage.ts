import type { AppRuleError } from './buildAppRule'

const MESSAGES: Record<AppRuleError, string> = {
  'no-app': 'Escolha um app.',
  'invalid-app': 'Esse nome de pacote não parece válido. Exemplo: com.instagram.android.',
  'no-windows': 'Adicione ao menos um horário permitido.',
  'no-days': 'Selecione ao menos um dia em cada horário.',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30.',
  'empty-window': 'O horário de início e o de fim não podem ser iguais.',
}

export function ruleErrorMessage(error: AppRuleError): string {
  return MESSAGES[error]
}
