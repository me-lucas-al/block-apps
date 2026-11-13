import type { NewBlockRule } from '@block-apps/api'
import type { BlockMode, TimeWindow } from '@block-apps/core'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import type { InstalledApp } from '../../modules/app-blocker'
import { AppPicker } from '../components/rules/apps/AppPicker'
import { RuleModeSelector } from '../components/rules/schedule/RuleModeSelector'
import { ScheduleEditor } from '../components/rules/schedule/ScheduleEditor'
import { Button } from '../components/ui/Button'
import { useAppCatalog } from '../hooks/rules/useAppCatalog'
import { buildAppRule } from '../rules/buildAppRule'
import { ruleErrorMessage } from '../rules/ruleErrorMessage'
import { colors } from '../theme'

type AddRuleScreenProps = {
  installedApps: readonly InstalledApp[]
  onSubmit: (rule: NewBlockRule) => Promise<void>
  onCancel: () => void
}

export function AddRuleScreen({ installedApps, onSubmit, onCancel }: AddRuleScreenProps) {
  const { suggestions, labelFor } = useAppCatalog(installedApps)
  const [packageName, setPackageName] = useState<string | null>(null)
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const result = buildAppRule({ packageName, mode, windows })
    if (!result.rule) return setError(ruleErrorMessage(result.error))

    try {
      setError(null)
      await onSubmit(result.rule)
      onCancel()
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Erro inesperado')
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Bloquear app</Text>
      <AppPicker
        installedApps={installedApps}
        suggestions={suggestions}
        labelFor={labelFor}
        selectedPackage={packageName}
        onSelect={setPackageName}
      />
      <RuleModeSelector mode={mode} onSelect={setMode} />
      {mode === 'schedule' && <ScheduleEditor windows={windows} onChange={setWindows} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Bloquear" onPress={() => void submit()} />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
