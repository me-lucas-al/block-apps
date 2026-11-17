import { describePendingChange } from '@block-apps/core'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { useStrictMode } from '../../hooks/rules/useStrictMode'
import { colors } from '../../theme'
import { Button } from '../ui/Button'
import {
  STRICT_MODE_DESCRIPTION,
  STRICT_MODE_NEEDS_ACCEPTANCE,
  STRICT_MODE_TITLE,
  STRICT_MODE_WARNING_MESSAGE,
  STRICT_MODE_WARNING_TITLE,
} from './strictModeTexts'

export function StrictModeCard() {
  const strictMode = useStrictMode()
  if (!strictMode.available || !strictMode.state) return null

  const askBeforeTurningOn = () => {
    Alert.alert(STRICT_MODE_WARNING_TITLE, STRICT_MODE_WARNING_MESSAGE, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ligar mesmo assim', style: 'destructive', onPress: () => void strictMode.turnOn() },
    ])
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{STRICT_MODE_TITLE}</Text>
      <Text style={styles.description}>{STRICT_MODE_DESCRIPTION}</Text>
      {strictMode.state.status === 'off' && (
        <Button label="Ligar" disabled={strictMode.busy} onPress={askBeforeTurningOn} />
      )}
      {strictMode.state.status === 'needsAcceptance' && (
        <>
          <Text style={styles.description}>{STRICT_MODE_NEEDS_ACCEPTANCE}</Text>
          <Button
            label="Confirmar neste aparelho"
            disabled={strictMode.busy}
            onPress={askBeforeTurningOn}
          />
          <Button
            label="Pedir para desligar"
            variant="secondary"
            disabled={strictMode.busy}
            onPress={() => void strictMode.requestTurnOff()}
          />
        </>
      )}
      {strictMode.state.status === 'on' && (
        <Button
          label="Pedir para desligar"
          variant="secondary"
          disabled={strictMode.busy}
          onPress={() => void strictMode.requestTurnOff()}
        />
      )}
      {strictMode.state.status === 'turningOff' && (
        <>
          <Text style={styles.description}>
            {describePendingChange(strictMode.state.removal, new Date())}
          </Text>
          <Button
            label="Cancelar o desligamento"
            variant="secondary"
            disabled={strictMode.busy}
            onPress={() => void strictMode.cancelTurnOff()}
          />
        </>
      )}
      {strictMode.error && <Text style={styles.error}>{strictMode.error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { gap: 8, padding: 12, borderRadius: 8, backgroundColor: colors.surface },
  title: { fontWeight: '600', color: colors.text },
  description: { color: colors.muted, fontSize: 12 },
  error: { color: colors.danger, fontSize: 12 },
})
