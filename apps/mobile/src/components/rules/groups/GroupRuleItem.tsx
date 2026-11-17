import { type BlockRule, type PendingRuleChange, describePendingChange } from '@block-apps/core'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { Button } from '../../ui/Button'
import { describeRule } from '../describeRule'

type GroupRuleItemProps = {
  rule: BlockRule
  appsChosen: boolean
  selectionUnreadable: boolean
  overAppLimit: boolean
  alwaysBlockedForLackOfSlots: boolean
  pendingChange: PendingRuleChange | undefined
  onChooseApps: (rule: BlockRule) => void
  onRemove: (ruleId: string) => void
  onCancel: (ruleId: string) => void
}

export function GroupRuleItem(props: GroupRuleItemProps) {
  const { rule, appsChosen, selectionUnreadable, overAppLimit } = props
  const { alwaysBlockedForLackOfSlots, pendingChange } = props
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>{rule.target}</Text>
        <Text style={styles.description}>{describeRule(rule)}</Text>
        {selectionUnreadable && (
          <Text style={styles.warning}>A escolha de apps guardada não pôde ser lida. Escolha de novo.</Text>
        )}
        {!appsChosen && !selectionUnreadable && (
          <Text style={styles.warning}>Escolha os apps de novo neste aparelho.</Text>
        )}
        {overAppLimit && (
          <Text style={styles.warning}>
            Este grupo tem mais de 50 apps. O iOS pode não bloquear todos; divida em grupos menores.
          </Text>
        )}
        {alwaysBlockedForLackOfSlots && (
          <Text style={styles.warning}>
            Há horários demais: este grupo fica bloqueado o tempo todo.
          </Text>
        )}
        {pendingChange && (
          <Text style={styles.description}>{describePendingChange(pendingChange, new Date())}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button
          label={appsChosen ? 'Editar apps' : 'Escolher apps'}
          variant="secondary"
          disabled={pendingChange?.kind === 'delete'}
          onPress={() => props.onChooseApps(rule)}
        />
        {pendingChange ? (
          <Button label="Cancelar" variant="secondary" onPress={() => props.onCancel(rule.id)} />
        ) : (
          <Button label="Remover" variant="secondary" onPress={() => props.onRemove(rule.id)} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  texts: { flex: 1 },
  actions: { gap: 6 },
  title: { fontWeight: '600', color: colors.text },
  description: { color: colors.muted, fontSize: 12 },
  warning: { color: colors.danger, fontSize: 12 },
})
