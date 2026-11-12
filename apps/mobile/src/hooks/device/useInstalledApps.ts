import { useMemo } from 'react'
import type { InstalledApp } from '../../../modules/app-blocker'
import { useServices } from '../../services/ServicesContext'

export function useInstalledApps(): InstalledApp[] {
  const { blocker } = useServices()
  return useMemo(() => blocker.listLaunchableApps(), [blocker])
}
