import type { AppOption } from '@block-apps/core'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'

type AppOptionRowProps = {
  option: AppOption
  selected: boolean
  onSelect: (packageName: string) => void
}

function describeOption(option: AppOption): string {
  if (option.installed) return 'Instalado'
  return option.suggested ? 'Sugestão, não instalado' : 'Não instalado'
}

export function AppOptionRow({ option, selected, onSelect }: AppOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(option.packageName)}
      style={[styles.row, selected && styles.selected]}
    >
      <View style={styles.texts}>
        <Text style={styles.label}>{option.label}</Text>
        <Text style={styles.package}>{option.packageName}</Text>
      </View>
      <Text style={styles.status}>{describeOption(option)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  selected: { backgroundColor: colors.surface },
  texts: { flex: 1 },
  label: { color: colors.text, fontWeight: '600' },
  package: { color: colors.muted, fontSize: 11 },
  status: { color: colors.muted, fontSize: 11 },
})
