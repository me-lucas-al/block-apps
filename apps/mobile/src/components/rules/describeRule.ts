import type { BlockRule } from '@block-apps/core'

export function describeRule(rule: BlockRule): string {
  if (rule.mode === 'always') return 'Sempre bloqueado'
  const count = rule.windows.length
  return `Permitido em ${count} ${count === 1 ? 'horário' : 'horários'}`
}
