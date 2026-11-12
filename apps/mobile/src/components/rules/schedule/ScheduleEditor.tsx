import type { TimeWindow } from '@block-apps/core'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { Button } from '../../ui/Button'
import { WindowCard } from './WindowCard'

const DEFAULT_WINDOW: TimeWindow = {
  days: [1, 2, 3, 4, 5],
  start: '18:00',
  end: '20:00',
}

type ScheduleEditorProps = {
  windows: readonly TimeWindow[]
  onChange: (windows: TimeWindow[]) => void
}

export function ScheduleEditor({ windows, onChange }: ScheduleEditorProps) {
  const replaceAt = (index: number, window: TimeWindow) =>
    onChange(windows.map((current, i) => (i === index ? window : current)))

  const removeAt = (index: number) => onChange(windows.filter((_, i) => i !== index))

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>Horários em que o app é permitido:</Text>
      {windows.map((window, index) => (
        <WindowCard
          key={index}
          window={window}
          onChange={(updated) => replaceAt(index, updated)}
          onRemove={() => removeAt(index)}
        />
      ))}
      <Button
        label="Adicionar horário"
        variant="secondary"
        onPress={() => onChange([...windows, DEFAULT_WINDOW])}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  hint: { color: colors.muted },
})
