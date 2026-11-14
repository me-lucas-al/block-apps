import { describeApiFailure, type NewBlockRule } from '@block-apps/api'
import type { BlockMode, TimeWindow } from '@block-apps/core'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import type { InstalledApp } from '../../modules/app-blocker'
import { AppPicker } from '../components/rules/apps/AppPicker'
import { KeywordField } from '../components/rules/keywords/KeywordField'
import { RuleKindSelector, type RuleKind } from '../components/rules/RuleKindSelector'
import { RuleModeSelector } from '../components/rules/RuleModeSelector'
import { Button } from '../components/ui/Button'
import { useAppCatalog } from '../hooks/rules/useAppCatalog'
import { buildAppRule } from '../rules/buildAppRule'
import { buildKeywordRule } from '../rules/buildKeywordRule'
import { ruleErrorMessage } from '../rules/ruleErrorMessage'
import { colors } from '../theme'

type AddRuleScreenProps = {
  installedApps: readonly InstalledApp[]
  onSubmit: (rule: NewBlockRule) => Promise<void>
  onCancel: () => void
}

export function AddRuleScreen({ installedApps, onSubmit, onCancel }: AddRuleScreenProps) {
  const { suggestions, labelFor } = useAppCatalog(installedApps)
  const [kind, setKind] = useState<RuleKind>('app')
  const [packageName, setPackageName] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [mode, setMode] = useState<BlockMode>('always')
  const [windows, setWindows] = useState<TimeWindow[]>([])
  const [error, setError] = useState<string | null>(null)

  const submitRule = async () => {
    const result =
      kind === 'app'
        ? buildAppRule({ packageName, mode, windows })
        : buildKeywordRule({ keyword, mode, windows })
    if (!result.rule) return setError(ruleErrorMessage(result.error))

    try {
      setError(null)
      await onSubmit(result.rule)
      onCancel()
    } catch (failure: unknown) {
      setError(describeApiFailure(failure))
    }
  }

  const changeRuleKind = (nextKind: RuleKind) => {
    setError(null)
    setKind(nextKind)
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Novo bloqueio</Text>
      <RuleKindSelector kind={kind} onKindChange={changeRuleKind} />
      {kind === 'app' ? (
        <AppPicker
          installedApps={installedApps}
          suggestions={suggestions}
          labelFor={labelFor}
          selectedPackage={packageName}
          onSelect={setPackageName}
        />
      ) : (
        <KeywordField keyword={keyword} onKeywordChange={setKeyword} />
      )}
      <RuleModeSelector
        mode={mode}
        windows={windows}
        onModeChange={setMode}
        onWindowsChange={setWindows}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Bloquear" onPress={() => void submitRule()} />
      <Button label="Cancelar" variant="secondary" onPress={onCancel} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 14, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  error: { color: colors.danger },
})
