import type { NewBlockRule } from '@block-apps/api'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { RuleModeSelector } from '../components/rules/schedule/RuleModeSelector'
import { ScheduleEditor } from '../components/rules/schedule/ScheduleEditor'
import { Button } from '../components/ui/Button'
import { TextField } from '../components/ui/TextField'
import { useIosGroupRuleForm } from '../hooks/rules/useIosGroupRuleForm'
import type { GroupSelectionPort } from '../ports/groupselection/GroupSelectionPort'
import { colors } from '../theme'

type AddGroupRuleScreenProps = {
  groupSelection: GroupSelectionPort
  onSubmit: (rule: NewBlockRule) => Promise<void>
  onCancel: () => void
}

export function AddGroupRuleScreen({ groupSelection, onSubmit, onCancel }: AddGroupRuleScreenProps) {
  const form = useIosGroupRuleForm({
    groupSelection,
    createGroupRule: onSubmit,
    closeForm: onCancel,
  })

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Bloquear grupo de apps</Text>
      <TextField
        placeholder="Nome do grupo, por exemplo Redes sociais"
        value={form.groupName}
        onChangeText={form.changeGroupName}
      />
      <Button
        label={form.appsChosen ? 'Apps escolhidos (alterar)' : 'Escolher apps'}
        variant={form.appsChosen ? 'secondary' : 'primary'}
        onPress={() => void form.chooseAppsForGroup()}
      />
      <RuleModeSelector mode={form.mode} onSelect={form.setMode} />
      {form.mode === 'schedule' && (
        <ScheduleEditor windows={form.windows} onChange={form.setWindows} />
      )}
      {form.error && <Text style={styles.error}>{form.error}</Text>}
      <Button label="Bloquear" onPress={() => void form.submitGroupRule()} />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
