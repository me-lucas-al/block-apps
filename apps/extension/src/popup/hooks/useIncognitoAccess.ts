import { useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'

export function useIncognitoAccess(): boolean | null {
  const { incognito } = useServices()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    void incognito.isAllowed().then(setAllowed)
  }, [incognito])

  return allowed
}
