import { useEffect } from 'react'
import { useServices } from '../services/ServicesContext'

export function useSessionSync(): void {
  const { sessionSync } = useServices()

  useEffect(() => sessionSync.start(), [sessionSync])
}
