import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../theme'
import { Button } from '../ui/Button'

type ProtectionRowProps = {
  title: string
  description: string
  active: boolean
  actionLabel: string
  onAction: () => void
}

export function ProtectionRow({
  title,
  description,
  active,
  actionLabel,
  onAction,
}: ProtectionRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title}>
          {active ? '✓ ' : '✗ '}
          {title}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {!active && <Button label={actionLabel} onPress={onAction} />}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  texts: { flex: 1, gap: 2 },
  title: { fontWeight: '600', color: colors.text },
  description: { color: colors.muted, fontSize: 12 },
})
