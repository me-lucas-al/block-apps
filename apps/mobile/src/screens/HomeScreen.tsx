import { useServices } from '../services/ServicesContext'
import { AppHomeScreen } from './home/AppHomeScreen'
import { GroupHomeScreen } from './home/GroupHomeScreen'

type HomeScreenProps = {
  email: string
}

export function HomeScreen({ email }: HomeScreenProps) {
  const { groupSelection } = useServices()
  if (groupSelection) return <GroupHomeScreen email={email} groupSelection={groupSelection} />
  return <AppHomeScreen email={email} />
}
