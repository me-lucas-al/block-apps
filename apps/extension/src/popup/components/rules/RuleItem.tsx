import type { BlockRule } from '@block-apps/core'

type RuleItemProps = {
  rule: BlockRule
  onRemove: (ruleId: string) => void
}

function describeRule(rule: BlockRule): string {
  if (rule.mode === 'always') return 'Sempre bloqueado'
  const count = rule.windows.length
  return `Permitido em ${count} ${count === 1 ? 'horário' : 'horários'}`
}

export function RuleItem({ rule, onRemove }: RuleItemProps) {
  return (
    <li className="rule">
      <div>
        <strong>{rule.target}</strong>
        <p className="hint">{describeRule(rule)}</p>
      </div>
      <button type="button" className="secondary" onClick={() => onRemove(rule.id)}>
        Remover
      </button>
    </li>
  )
}
