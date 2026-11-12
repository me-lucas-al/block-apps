import type { SiteRuleError } from './buildSiteRule'

const MESSAGES: Record<SiteRuleError, string> = {
  'invalid-site': 'Informe um site válido, ex.: youtube.com',
  'no-windows': 'Adicione ao menos um horário permitido',
  'no-days': 'Selecione ao menos um dia em cada horário',
  'invalid-time': 'Use o formato HH:mm, por exemplo 18:30',
}

export function ruleErrorMessage(error: SiteRuleError): string {
  return MESSAGES[error]
}
