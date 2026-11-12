import { type AppSuggestion, type KnownApp, searchApps } from '@block-apps/core'
import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { TextField } from '../../ui/TextField'
import { AppOptionRow } from './AppOptionRow'

const MAX_VISIBLE_OPTIONS = 20

type AppPickerProps = {
  installedApps: readonly KnownApp[]
  suggestions: readonly AppSuggestion[]
  labelFor: (packageName: string) => string
  selectedPackage: string | null
  onSelect: (packageName: string) => void
}

export function AppPicker({
  installedApps,
  suggestions,
  labelFor,
  selectedPackage,
  onSelect,
}: AppPickerProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(
    () => searchApps({ installed: installedApps, suggestions, query }),
    [installedApps, suggestions, query],
  )
  const visibleOptions = results.slice(0, MAX_VISIBLE_OPTIONS)
  const hiddenCount = results.length - visibleOptions.length

  return (
    <View style={styles.container}>
      <TextField
        placeholder="Nome do app, pacote ou link da Play Store"
        value={query}
        onChangeText={setQuery}
      />
      <Text style={styles.hint}>Você pode bloquear um app mesmo sem tê-lo instalado.</Text>
      {selectedPackage && (
        <Text style={styles.selected}>Selecionado: {labelFor(selectedPackage)}</Text>
      )}
      {results.length === 0 && <Text style={styles.hint}>Nenhum app encontrado.</Text>}
      {visibleOptions.map((option) => (
        <AppOptionRow
          key={option.packageName}
          option={option}
          selected={option.packageName === selectedPackage}
          onSelect={onSelect}
        />
      ))}
      {hiddenCount > 0 && (
        <Text style={styles.hint}>
          Mais {hiddenCount} resultados. Refine a busca para encontrar o app.
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  hint: { color: colors.muted, fontSize: 12 },
  selected: { color: colors.text, fontWeight: '600' },
})
