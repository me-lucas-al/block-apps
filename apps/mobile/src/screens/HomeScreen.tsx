import { StyleSheet, Text, View } from 'react-native'
import { useServices } from '../services/ServicesContext'
import { colors } from '../theme'
import { AppHomeScreen } from './home/AppHomeScreen'
import { GroupHomeScreen } from './home/GroupHomeScreen'

type HomeScreenProps = {
  email: string
  syncFailure: string | null
}

export function HomeScreen({ email, syncFailure }: HomeScreenProps) {
  const { groupSelection } = useServices()
  const home = groupSelection ? (
    <GroupHomeScreen email={email} groupSelection={groupSelection} />
  ) : (
    <AppHomeScreen email={email} />
  )
  return (
    <View style={styles.container}>
      {syncFailure && <Text style={styles.syncFailure}>{syncFailure}</Text>}
      {home}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  syncFailure: { color: colors.danger, paddingHorizontal: 20, paddingTop: 12 },
})
