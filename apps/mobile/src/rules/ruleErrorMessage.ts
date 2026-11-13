import type { AppRuleError } from './buildAppRule'
import type { IosGroupRuleError } from './buildIosGroupRule'

export type RuleDraftError = AppRuleError | IosGroupRuleError | 'no-apps'

const MESSAGES: Record<RuleDraftError, string> = {
  'no-app': 'Escolha um app.',
  'invalid-app': 'Esse nome de pacote não parece válido. Exemplo: com.instagram.android.',
  'no-name': 'Dê um nome ao grupo de apps.',
  'invalid-name': 'Use letras ou números no nome do grupo, com até 50 caracteres.',
  'no-apps': 'Escolha os apps do grupo.',
  'no-windows': 'Adicione ao menos um horário permitido.',
  'no-days': 'Selecione ao menos um dia em cada horário.',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30.',
  'empty-window': 'O horário de início e o de fim não podem ser iguais.',
}

export function ruleErrorMessage(error: RuleDraftError): string {
  return MESSAGES[error]
}
