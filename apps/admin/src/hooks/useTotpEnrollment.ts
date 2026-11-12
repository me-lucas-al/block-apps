import { useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'
import { describeFailure } from '../users/adminErrorMessage'

type EnrollmentState = {
  secret: string | null
  error: string | null
}

export function useTotpEnrollment() {
  const { authenticator } = useServices()
  const [state, setState] = useState<EnrollmentState>({ secret: null, error: null })

  useEffect(() => {
    let active = true
    authenticator.beginTotpEnrollment?.().then(
      (secret) => active && setState({ secret, error: null }),
      (failure) => active && setState({ secret: null, error: describeFailure(failure) }),
    )
    return () => {
      active = false
    }
  }, [authenticator])

  const confirm = (code: string) => authenticator.confirmTotpEnrollment?.(code) ?? Promise.resolve()

  return { ...state, confirm }
}
