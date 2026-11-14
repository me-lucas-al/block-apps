import { useMemo } from 'react'
import type { InstalledApp } from '../../../modules/app-blocker'
import { useServices } from '../../services/ServicesContext'

export function useInstalledApps(): readonly InstalledApp[] {
  const { appChoice } = useServices()
  return useMemo(() => appChoice.listInstalledApps(), [appChoice])
}
