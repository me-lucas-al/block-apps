import type { BlockMode } from '@block-apps/core'
import { StyleSheet, View } from 'react-native'
import { Button } from '../../ui/Button'

type RuleModeSelectorProps = {
  mode: BlockMode
  onSelect: (mode: BlockMode) => void
}

export function RuleModeSelector({ mode, onSelect }: RuleModeSelectorProps) {
  return (
    <View style={styles.modes}>
      <Button label="Sempre" variant={mode === 'always' ? 'primary' : 'secondary'}
        onPress={() => onSelect('always')} />
      <Button label="Só em horários" variant={mode === 'schedule' ? 'primary' : 'secondary'}
        onPress={() => onSelect('schedule')} />
    </View>
  )
}

const styles = StyleSheet.create({
  modes: { flexDirection: 'row', gap: 8 },
})
