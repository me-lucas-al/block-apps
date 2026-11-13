import { useEffect } from 'react'
import { scheduleShieldRefreshInBackground } from '../../background/shieldRefreshTask'
import { useServices } from '../../services/ServicesContext'

export function useShieldRefreshInBackground(): void {
  const { needsBackgroundRefresh } = useServices()

  useEffect(() => {
    if (!needsBackgroundRefresh) return
    void scheduleShieldRefreshInBackground().catch(() => undefined)
  }, [needsBackgroundRefresh])
}
