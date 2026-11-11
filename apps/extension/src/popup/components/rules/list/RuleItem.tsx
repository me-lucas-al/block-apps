import { type BlockRule, type PendingRuleChange, formatRemaining } from '@block-apps/core'

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

function describePending(change: PendingRuleChange): string {
  const label = change.kind === 'delete' ? 'Remoção' : 'Alteração'
  return `${label} em ${formatRemaining(change.effectiveAt, new Date())}`
}

export function RuleItem({ rule, pendingChange, onRemove, onCancel }: RuleItemProps) {
  return (
    <li className="rule">
      <div>
        <strong>{rule.target}</strong>
        <p className="hint">{describeRule(rule)}</p>
        {pendingChange && <p className="hint">{describePending(pendingChange)}</p>}
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
