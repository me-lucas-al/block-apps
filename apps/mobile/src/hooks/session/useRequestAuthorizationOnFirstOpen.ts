import { useEffect, useState } from 'react'
import { describeAppFailure } from '../../errors/describeAppFailure'
import { useServices } from '../../services/ServicesContext'

export function useRequestAuthorizationOnFirstOpen(signedInEmail: string | null): {
  authorizationFailure: string | null
} {
  const { protection } = useServices()
  const [authorizationFailure, setAuthorizationFailure] = useState<string | null>(null)

  useEffect(() => {
    if (!signedInEmail) return
    protection
      .requestAuthorizationOnFirstOpen()
      .catch((failure: unknown) => setAuthorizationFailure(describeAppFailure(failure)))
  }, [protection, signedInEmail])

  return { authorizationFailure }
}
