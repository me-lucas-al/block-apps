import { useCallback, useEffect, useState } from 'react'
import type { AdminUser, CreateUserInput, UpdateUserInput } from '../ports/userTypes'
import { useServices } from '../services/ServicesContext'
import { describeFailure } from '../users/adminErrorMessage'

export function useUsers() {
  const { users: gateway } = useServices()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadUsers = useCallback(async () => {
    try {
      setUsers(await gateway.list())
    } catch (failure) {
      setError(describeFailure(failure))
    } finally {
      setLoading(false)
    }
  }, [gateway])

  const applyUserActionThenReload = useCallback(
    async (action: () => Promise<unknown>): Promise<boolean> => {
      try {
        setError(null)
        await action()
        await reloadUsers()
        return true
      } catch (failure) {
        setError(describeFailure(failure))
        await reloadUsers()
        return false
      }
    },
    [reloadUsers],
  )

  useEffect(() => {
    void reloadUsers()
  }, [reloadUsers])

  return {
    users,
    loading,
    error,
    create: (newUser: CreateUserInput) => applyUserActionThenReload(() => gateway.create(newUser)),
    update: (userId: string, changes: UpdateUserInput) =>
      applyUserActionThenReload(() => gateway.update(userId, changes)),
    remove: (userId: string) => applyUserActionThenReload(() => gateway.remove(userId)),
  }
}
