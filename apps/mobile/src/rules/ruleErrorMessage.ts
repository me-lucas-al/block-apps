import { MAX_KEYWORD_LENGTH } from '@block-apps/core'
import type { AppRuleError } from './buildAppRule'
import type { KeywordRuleError } from './buildKeywordRule'

export type RuleFormError = AppRuleError | KeywordRuleError

const MESSAGES: Record<RuleFormError, string> = {
  'no-app': 'Escolha um app.',
  'invalid-app': 'Esse nome de pacote não parece válido. Exemplo: com.instagram.android.',
  'invalid-keyword': `Informe uma palavra ou frase com até ${MAX_KEYWORD_LENGTH} caracteres.`,
  'no-windows': 'Adicione ao menos um horário permitido.',
  'no-days': 'Selecione ao menos um dia em cada horário.',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30.',
  'empty-window': 'O horário de início e o de fim não podem ser iguais.',
}

export function ruleErrorMessage(error: RuleFormError): string {
  return MESSAGES[error]
}
