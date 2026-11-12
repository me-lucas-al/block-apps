import { type BlockRule, type PendingRuleChange, describePendingChange } from '@block-apps/core'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { Button } from '../../ui/Button'

type AppRuleItemProps = {
  rule: BlockRule
  label: string
  pendingChange: PendingRuleChange | undefined
  onRemove: (ruleId: string) => void
  onCancel: (changeId: string) => void
}

function describeRule(rule: BlockRule): string {
  if (rule.mode === 'always') return 'Sempre bloqueado'
  const count = rule.windows.length
  return `Permitido em ${count} ${count === 1 ? 'horário' : 'horários'}`
}

export function AppRuleItem({ rule, label, pendingChange, onRemove, onCancel }: AppRuleItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.description}>{describeRule(rule)}</Text>
        {pendingChange && (
          <Text style={styles.description}>{describePendingChange(pendingChange, new Date())}</Text>
        )}
      </View>
      {pendingChange ? (
        <Button label="Cancelar" variant="secondary" onPress={() => onCancel(pendingChange.id)} />
      ) : (
        <Button label="Remover" variant="secondary" onPress={() => onRemove(rule.id)} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  texts: { flex: 1 },
  title: { fontWeight: '600', color: colors.text },
  description: { color: colors.muted, fontSize: 12 },
})
