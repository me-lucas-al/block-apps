import { useEffect, useState } from 'react'
import { useServices } from '../services/ServicesContext'

type SessionState = {
  email: string | null
  loading: boolean
}

export function useSessionEmail(): SessionState {
  const { userSession } = useServices()
  const [sessionState, setSessionState] = useState<SessionState>({ email: null, loading: true })

  useEffect(() => {
    void userSession
      .currentUserEmail()
      .then((email) => setSessionState({ email, loading: false }))
    return userSession.watchUserEmail((email) => setSessionState({ email, loading: false }))
  }, [userSession])

  return sessionState
}
