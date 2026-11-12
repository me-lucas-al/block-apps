import type { BlockRuleError } from './buildBlockRule'

const MESSAGES: Record<BlockRuleError, string> = {
  'invalid-site': 'Informe um site válido, ex.: youtube.com',
  'invalid-keyword': 'Informe uma palavra ou frase com até 100 caracteres',
  'no-windows': 'Adicione ao menos um horário permitido',
  'no-days': 'Selecione ao menos um dia em cada horário',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30',
}

export function ruleErrorMessage(error: BlockRuleError): string {
  return MESSAGES[error]
}
