import { StyleSheet, Text, View } from 'react-native'
import { useSignOut } from '../../hooks/session/useSignOut'
import { colors } from '../../theme'
import { Button } from '../ui/Button'

type HomeHeaderProps = {
  email: string
}

export function HomeHeader({ email }: HomeHeaderProps) {
  const signOut = useSignOut()
  return (
    <View style={styles.header}>
      <Text style={styles.email}>{email}</Text>
      <Button label="Sair" variant="secondary" onPress={() => void signOut()} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  email: { color: colors.muted },
})
