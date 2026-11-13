import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../theme'
import { TextField } from '../../ui/TextField'

type KeywordFieldProps = {
  keyword: string
  onKeywordChange: (keyword: string) => void
}

export function KeywordField({ keyword, onKeywordChange }: KeywordFieldProps) {
  return (
    <View style={styles.container}>
      <TextField
        value={keyword}
        onChangeText={onKeywordChange}
        placeholder="Palavra ou frase, ex.: aposta online"
        maxLength={100}
      />
      <Text style={styles.notice}>
        A palavra fica salva na sua conta e bloqueia buscas nos navegadores com a extensão. Neste
        celular o bloqueio de buscas ainda não é aplicado.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  notice: { color: colors.muted, fontSize: 12 },
})
