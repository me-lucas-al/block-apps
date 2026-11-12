import { useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

type SessionState = {
  email: string | null
  loading: boolean
}

export function useSessionEmail(): SessionState {
  const { auth } = useServices()
  const [state, setState] = useState<SessionState>({ email: null, loading: true })

  useEffect(() => {
    void auth
      .currentUserEmail()
      .then((email) => setState({ email, loading: false }))
    return auth.onChange((email) => setState({ email, loading: false }))
  }, [auth])

  return state
}
