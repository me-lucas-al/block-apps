import type { BlockMode, TimeWindow } from '@block-apps/core'
import { StyleSheet, View } from 'react-native'
import { Button } from '../ui/Button'
import { ScheduleEditor } from './schedule/ScheduleEditor'

type RuleModeSelectorProps = {
  mode: BlockMode
  windows: TimeWindow[]
  onModeChange: (mode: BlockMode) => void
  onWindowsChange: (windows: TimeWindow[]) => void
}

export function RuleModeSelector({
  mode,
  windows,
  onModeChange,
  onWindowsChange,
}: RuleModeSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.modes}>
        <Button
          label="Sempre"
          variant={mode === 'always' ? 'primary' : 'secondary'}
          onPress={() => onModeChange('always')}
        />
        <Button
          label="Só em horários"
          variant={mode === 'schedule' ? 'primary' : 'secondary'}
          onPress={() => onModeChange('schedule')}
        />
      </View>
      {mode === 'schedule' && <ScheduleEditor windows={windows} onChange={onWindowsChange} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  modes: { flexDirection: 'row', gap: 8 },
})
