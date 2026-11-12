import { RULE_KINDS, RULE_KIND_LABELS, type RuleKind } from '../ruleKinds'

type RuleKindTabsProps = {
  selectedKind: RuleKind
  onSelect: (kind: RuleKind) => void
}

export function RuleKindTabs({ selectedKind, onSelect }: RuleKindTabsProps) {
  return (
    <div className="row" role="tablist">
      {RULE_KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          role="tab"
          aria-selected={kind === selectedKind}
          className={kind === selectedKind ? undefined : 'secondary'}
          onClick={() => onSelect(kind)}
        >
          {RULE_KIND_LABELS[kind].tab}
        </button>
      ))}
    </div>
  )
}
