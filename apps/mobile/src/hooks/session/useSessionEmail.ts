import { useEffect, useState } from 'react'
import { useServices } from '../../services/ServicesContext'

type SessionState = {
  email: string | null
  loading: boolean
}

export function useSessionEmail(): SessionState {
  const { userSession } = useServices()
  const [state, setState] = useState<SessionState>({ email: null, loading: true })

  useEffect(() => {
    void userSession
      .currentUserEmail()
      .then((email) => setState({ email, loading: false }))
      .catch(() => setState({ email: null, loading: false }))
    return userSession.watchUserEmail((email) => setState({ email, loading: false }))
  }, [userSession])

  return state
}
