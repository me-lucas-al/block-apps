import type { TimeWindow } from '@block-apps/core'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { Button } from '../../ui/Button'
import { TextField } from '../../ui/TextField'
import { DayChips } from './DayChips'

type WindowCardProps = {
  window: TimeWindow
  onChange: (window: TimeWindow) => void
  onRemove: () => void
}

export function WindowCard({ window, onChange, onRemove }: WindowCardProps) {
  return (
    <View style={styles.card}>
      <DayChips days={window.days} onChange={(days) => onChange({ ...window, days })} />
      <View style={styles.times}>
        <TextField
          style={styles.time}
          value={window.start}
          placeholder="HH:mm"
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          onChangeText={(start) => onChange({ ...window, start })}
        />
        <Text style={styles.separator}>até</Text>
        <TextField
          style={styles.time}
          value={window.end}
          placeholder="HH:mm"
          keyboardType="numbers-and-punctuation"
          maxLength={5}
          onChangeText={(end) => onChange({ ...window, end })}
        />
        <Button label="Remover" variant="secondary" onPress={onRemove} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  times: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  time: { width: 76, textAlign: 'center' },
  separator: { color: colors.muted },
})
