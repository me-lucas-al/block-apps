import { MAX_KEYWORD_LENGTH } from '@block-apps/core'
import type { AppRuleError } from './buildAppRule'
import type { IosGroupRuleError } from './buildIosGroupRule'
import type { KeywordRuleError } from './buildKeywordRule'

export type RuleFormError =
  | AppRuleError
  | KeywordRuleError
  | IosGroupRuleError
  | 'no-apps'
  | 'not-authorized'

const MESSAGES: Record<RuleFormError, string> = {
  'no-app': 'Escolha um app.',
  'invalid-app': 'Esse nome de pacote não parece válido. Exemplo: com.instagram.android.',
  'invalid-keyword': `Informe uma palavra ou frase com até ${MAX_KEYWORD_LENGTH} caracteres.`,
  'no-name': 'Dê um nome ao grupo de apps.',
  'invalid-name': 'Use letras ou números no nome do grupo, com até 50 caracteres.',
  'no-apps': 'Escolha os apps do grupo.',
  'not-authorized': 'Autorize o Tempo de Uso antes de escolher os apps.',
  'no-windows': 'Adicione ao menos um horário permitido.',
  'no-days': 'Selecione ao menos um dia em cada horário.',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30.',
  'empty-window': 'O horário de início e o de fim não podem ser iguais.',
}

export function ruleErrorMessage(error: RuleFormError): string {
  return MESSAGES[error]
}
