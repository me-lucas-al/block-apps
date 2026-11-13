import { StyleSheet, View } from 'react-native'
import { Button } from '../ui/Button'

export type RuleKind = 'app' | 'keyword'

type RuleKindSelectorProps = {
  kind: RuleKind
  onKindChange: (kind: RuleKind) => void
}

export function RuleKindSelector({ kind, onKindChange }: RuleKindSelectorProps) {
  return (
    <View style={styles.kinds}>
      <Button
        label="App"
        variant={kind === 'app' ? 'primary' : 'secondary'}
        onPress={() => onKindChange('app')}
      />
      <Button
        label="Palavra de busca"
        variant={kind === 'keyword' ? 'primary' : 'secondary'}
        onPress={() => onKindChange('keyword')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  kinds: { flexDirection: 'row', gap: 8 },
})
