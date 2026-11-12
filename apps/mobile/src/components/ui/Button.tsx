import { Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../../theme'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ label, onPress, variant = 'primary', disabled }: ButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.base, isPrimary ? styles.primary : styles.secondary, disabled && styles.disabled]}
    >
      <Text style={isPrimary ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  primaryLabel: { color: colors.onPrimary, fontWeight: '600' },
  secondaryLabel: { color: colors.text, fontWeight: '600' },
})
