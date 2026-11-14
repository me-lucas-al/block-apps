import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'
import { messageOf } from '../../errors/messageOf'
import { useServices } from '../../services/ServicesContext'
import type { StrictModeState } from '../../strictmode/StrictModeState'

export function useStrictMode() {
  const { strictMode } = useServices()
  const [state, setState] = useState<StrictModeState | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reloadState = useCallback(async () => {
    if (!strictMode) return
    try {
      setState(await strictMode.readState())
    } catch (failure) {
      setError(messageOf(failure))
    }
  }, [strictMode])

  useEffect(() => {
    void reloadState()
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void reloadState()
    })
    return () => subscription.remove()
  }, [reloadState])

  const changeThenReload = async (change: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await change()
    } catch (failure) {
      setError(messageOf(failure))
    } finally {
      setBusy(false)
      await reloadState()
    }
  }

  return {
    available: strictMode !== null,
    state,
    busy,
    error,
    turnOn: () => changeThenReload(() => strictMode?.turnOn() ?? Promise.resolve()),
    requestTurnOff: () => changeThenReload(() => strictMode?.requestTurnOff() ?? Promise.resolve()),
    cancelTurnOff: () => changeThenReload(() => strictMode?.cancelTurnOff() ?? Promise.resolve()),
  }
}
