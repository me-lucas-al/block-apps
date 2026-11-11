import type { NewBlockRule } from '@block-apps/api'
import type { BlockMode, TimeWindow } from '@block-apps/core'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { InstalledApp } from '../../modules/app-blocker'
import { AppPicker } from '../components/rules/AppPicker'
import { ScheduleEditor } from '../components/rules/ScheduleEditor'
import { Button } from '../components/ui/Button'
import { buildAppRule } from '../rules/buildAppRule'
import { ruleErrorMessage } from '../rules/ruleErrorMessage'
import { colors } from '../theme'

type AddRuleScreenProps = {
  apps: readonly InstalledApp[]
  onSubmit: (rule: NewBlockRule) => Promise<void>
  onCancel: () => void
}

export function AddRuleScreen({ apps, onSubmit, onCancel }: AddRuleScreenProps) {
  const [packageName, setPackageName] = useState<string | null>(null)
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const result = buildAppRule({ packageName, mode, windows })
    if (!result.rule) return setError(ruleErrorMessage(result.error))

    setError(null)
    await onSubmit(result.rule)
    onCancel()
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bloquear app</Text>
      <AppPicker apps={apps} selectedPackage={packageName} onSelect={setPackageName} />
      <View style={styles.modes}>
        <Button label="Sempre" variant={mode === 'always' ? 'primary' : 'secondary'}
          onPress={() => setMode('always')} />
        <Button label="Só em horários" variant={mode === 'schedule' ? 'primary' : 'secondary'}
          onPress={() => setMode('schedule')} />
      </View>
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
  modes: { flexDirection: 'row', gap: 8 },
  error: { color: colors.danger },
})
