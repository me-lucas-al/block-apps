import { type KnownApp, POPULAR_ANDROID_APPS, searchApps } from '@block-apps/core'
import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'
import { TextField } from '../ui/TextField'
import { AppOptionRow } from './AppOptionRow'

const MAX_VISIBLE_OPTIONS = 40

type AppPickerProps = {
  installedApps: readonly KnownApp[]
  selectedPackage: string | null
  onSelect: (packageName: string) => void
}

export function AppPicker({ installedApps, selectedPackage, onSelect }: AppPickerProps) {
  const [query, setQuery] = useState('')

  const options = useMemo(
    () =>
      searchApps({ installed: installedApps, suggestions: POPULAR_ANDROID_APPS, query }).slice(
        0,
        MAX_VISIBLE_OPTIONS,
      ),
    [installedApps, query],
  )

  return (
    <View style={styles.container}>
      <TextField
        placeholder="Nome do app, pacote ou link da Play Store"
        value={query}
        onChangeText={setQuery}
      />
      <Text style={styles.hint}>
        Você pode bloquear um app mesmo sem tê-lo instalado.
      </Text>
      {options.length === 0 && <Text style={styles.hint}>Nenhum app encontrado.</Text>}
      {options.map((option) => (
        <AppOptionRow
          key={option.packageName}
          option={option}
          selected={option.packageName === selectedPackage}
          onSelect={onSelect}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  hint: { color: colors.muted, fontSize: 12 },
})
