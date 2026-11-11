import { useSiteRules } from '../../../hooks/useSiteRules'
import { RuleForm } from '../form/RuleForm'
import { RuleItem } from './RuleItem'

export function RulesPanel() {
  const { rules, error, create, remove } = useSiteRules()

  return (
    <section className="stack">
      <RuleForm onSubmit={create} />
      {error && <p className="error">{error}</p>}
      {rules.length === 0 ? (
        <p className="hint">Nenhum site bloqueado ainda.</p>
      ) : (
        <ul className="rules">
          {rules.map((rule) => (
            <RuleItem key={rule.id} rule={rule} onRemove={remove} />
          ))}
        </ul>
      )}
    </section>
  )
}
