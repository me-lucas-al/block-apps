import { useState } from 'react'
import { useBlockRules } from '../../../hooks/useBlockRules'
import { RuleForm } from '../form/RuleForm'
import { RULE_KIND_LABELS, type RuleKind } from '../ruleKinds'
import { RuleItem } from './RuleItem'
import { RuleKindTabs } from './RuleKindTabs'

export function RulesPanel() {
  const { rules, pendingChanges, error, create, requestRemoval, cancelChange } = useBlockRules()
  const [selectedKind, setSelectedKind] = useState<RuleKind>('site')
  const selectedRules = rules.filter((rule) => rule.targetType === selectedKind)

  return (
    <section className="stack">
      <RuleKindTabs selectedKind={selectedKind} onSelect={setSelectedKind} />
      <RuleForm key={selectedKind} kind={selectedKind} onSubmit={create} />
      {error && <p className="error">{error}</p>}
      {selectedRules.length === 0 ? (
        <p className="hint">{RULE_KIND_LABELS[selectedKind].empty}</p>
      ) : (
        <ul className="rules">
          {selectedRules.map((rule) => (
            <RuleItem
              key={rule.id}
              rule={rule}
              pendingChange={pendingChanges.find((change) => change.ruleId === rule.id)}
              onRemove={requestRemoval}
              onCancel={cancelChange}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
