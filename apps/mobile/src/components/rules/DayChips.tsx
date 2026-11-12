import { type DayOfWeek, toggleDay } from '@block-apps/core'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'

const DAYS: ReadonlyArray<{ day: DayOfWeek; label: string }> = [
  { day: 0, label: 'D' },
  { day: 1, label: 'S' },
  { day: 2, label: 'T' },
  { day: 3, label: 'Q' },
  { day: 4, label: 'Q' },
  { day: 5, label: 'S' },
  { day: 6, label: 'S' },
]

type DayChipsProps = {
  days: readonly DayOfWeek[]
  onChange: (days: DayOfWeek[]) => void
}

export function DayChips({ days, onChange }: DayChipsProps) {
  return (
    <View style={styles.row}>
      {DAYS.map(({ day, label }) => {
        const selected = days.includes(day)
        return (
          <Pressable
            key={day}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(toggleDay(days, day))}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={selected ? styles.labelSelected : styles.label}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  chip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary },
  label: { color: colors.text },
  labelSelected: { color: colors.onPrimary, fontWeight: '600' },
})
