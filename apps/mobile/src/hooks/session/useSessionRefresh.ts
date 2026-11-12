import { useEffect } from 'react'
import { AppState } from 'react-native'
import { useServices } from '../../services/ServicesContext'

export function useSessionRefresh(): void {
  const { sessionRefresh } = useServices()

  useEffect(() => {
    sessionRefresh.start()
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sessionRefresh.start()
      else sessionRefresh.stop()
    })
    return () => subscription.remove()
  }, [sessionRefresh])
}
