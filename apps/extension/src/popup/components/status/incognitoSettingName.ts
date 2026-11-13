import type { BrowserTarget } from '../../../shared/browser/browserTarget'

export function incognitoSettingName(target: BrowserTarget): string {
  if (target === 'firefox') return 'Executar em janelas privativas'
  return 'Permitir no modo anônimo'
}
