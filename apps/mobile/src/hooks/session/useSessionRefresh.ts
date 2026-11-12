import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useServices } from '../../services/ServicesContext'

export function useSessionRefresh(): void {
  const { rulesSync, statusReporter } = useServices()

  useEffect(() => {
    const onActive = () => {
      void rulesSync.sync().catch(() => {})
      void statusReporter.report().catch(() => {})
    }

    onActive()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') onActive()
    })
    return () => subscription.remove()
  }, [rulesSync, statusReporter])
}
