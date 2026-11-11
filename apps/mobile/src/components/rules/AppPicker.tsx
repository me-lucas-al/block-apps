import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import type { InstalledApp } from '../../../modules/app-blocker'
import { colors } from '../../theme'
import { TextField } from '../ui/TextField'

type AppPickerProps = {
  apps: readonly InstalledApp[]
  selectedPackage: string | null
  onSelect: (packageName: string) => void
}

export function AppPicker({ apps, selectedPackage, onSelect }: AppPickerProps) {
  const [query, setQuery] = useState('')

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return apps.filter((app) => app.label.toLowerCase().includes(normalized))
  }, [apps, query])

  return (
    <View style={styles.container}>
      <TextField placeholder="Buscar app" value={query} onChangeText={setQuery} />
      <FlatList
        data={visibleApps}
        keyExtractor={(app) => app.packageName}
        style={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.packageName)}
            style={[styles.item, item.packageName === selectedPackage && styles.selected]}
          >
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.package}>{item.packageName}</Text>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 8, flex: 1 },
  list: { maxHeight: 240 },
  item: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  selected: { backgroundColor: colors.surface },
  label: { color: colors.text, fontWeight: '600' },
  package: { color: colors.muted, fontSize: 11 },
})
