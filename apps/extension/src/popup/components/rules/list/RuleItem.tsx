import { type BlockRule, type PendingRuleChange, describePendingChange } from '@block-apps/core'

type RuleItemProps = {
  rule: BlockRule
  pendingChange: PendingRuleChange | undefined
  onRemove: (ruleId: string) => void
  onCancel: (changeId: string) => void
}

function describeRule(rule: BlockRule): string {
  if (rule.mode === 'always') return 'Sempre bloqueado'
  const count = rule.windows.length
  return `Permitido em ${count} ${count === 1 ? 'horário' : 'horários'}`
}

export function RuleItem({ rule, pendingChange, onRemove, onCancel }: RuleItemProps) {
  return (
    <li className="rule">
      <div>
        <strong>{rule.target}</strong>
        <p className="hint">{describeRule(rule)}</p>
        {pendingChange && <p className="hint">{describePendingChange(pendingChange, new Date())}</p>}
      </div>
      {pendingChange ? (
        <button type="button" className="secondary" onClick={() => onCancel(pendingChange.id)}>
          Cancelar
        </button>
      ) : (
        <button type="button" className="secondary" onClick={() => onRemove(rule.id)}>
          Remover
        </button>
      )}
    </li>
  )
}
