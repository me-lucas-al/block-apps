import { useState } from 'react'
import { UserForm } from '../components/users/UserForm'
import { UserTable } from '../components/users/UserTable'
import { useUsers } from '../hooks/useUsers'
import type { AdminUser } from '../ports/userTypes'
import { EMPTY_USER_FORM, formFromUser, toCreateInput, toUpdateInput } from '../users/userForm'
import type { UserFormState } from '../users/userForm'

type Editing = { kind: 'create' } | { kind: 'edit'; user: AdminUser } | null

type UsersScreenProps = {
  currentUserId: string
}

export function UsersScreen({ currentUserId }: UsersScreenProps) {
  const { users, loading, error, create, update, remove } = useUsers()
  const [editing, setEditing] = useState<Editing>(null)

  const saveUserForm = async (form: UserFormState) => {
    if (!editing) return
    const saved =
      editing.kind === 'create'
        ? await create(toCreateInput(form))
        : await update(editing.user.id, toUpdateInput(form, editing.user))
    if (saved) setEditing(null)
  }

  return (
    <section className="stack">
      <header className="row between">
        <h1>Usuários</h1>
        <button type="button" onClick={() => setEditing({ kind: 'create' })}>Novo usuário</button>
      </header>
      {error && <p className="error" role="alert">{error}</p>}
      {editing && (
        <UserForm
          key={editing.kind === 'edit' ? editing.user.id : 'create'}
          mode={editing.kind}
          initial={editing.kind === 'edit' ? formFromUser(editing.user) : EMPTY_USER_FORM}
          onSubmit={saveUserForm}
          onCancel={() => setEditing(null)}
        />
      )}
      {loading ? (
        <p className="hint">Carregando…</p>
      ) : (
        <UserTable
          users={users}
          currentUserId={currentUserId}
          onEdit={(user) => setEditing({ kind: 'edit', user })}
          onRemove={(userId) => void remove(userId)}
        />
      )}
    </section>
  )
}
