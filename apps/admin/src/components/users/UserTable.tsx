import type { AdminUser } from '../../ports/userTypes'
import { UserRow } from './UserRow'

type UserTableProps = {
  users: readonly AdminUser[]
  currentUserId: string
  onEdit: (user: AdminUser) => void
  onRemove: (userId: string) => void
}

export function UserTable({ users, currentUserId, onEdit, onRemove }: UserTableProps) {
  if (users.length === 0) return <p className="hint">Nenhum usuário cadastrado.</p>

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>E-mail</th>
            <th>Nome</th>
            <th>Papel</th>
            <th>Cooldown</th>
            <th>Último acesso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
