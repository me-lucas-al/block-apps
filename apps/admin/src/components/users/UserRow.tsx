import { useState } from 'react'
import type { AdminUser } from '../../ports/userTypes'

type UserRowProps = {
  user: AdminUser
  isSelf: boolean
  onEdit: (user: AdminUser) => void
  onRemove: (userId: string) => void
}

function formatLastSignIn(value: string | null): string {
  return value ? new Date(value).toLocaleString('pt-BR') : 'nunca'
}

export function UserRow({ user, isSelf, onEdit, onRemove }: UserRowProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <tr>
      <td>{user.email}{isSelf && <span className="badge">você</span>}</td>
      <td>{user.displayName ?? '—'}</td>
      <td>{user.role === 'admin' ? 'Administrador' : 'Usuário comum'}</td>
      <td>{user.cooldownHours} h</td>
      <td>{formatLastSignIn(user.lastSignInAt)}</td>
      <td className="actions">
        <button type="button" className="secondary" onClick={() => onEdit(user)}>Editar</button>
        {isSelf ? null : confirming ? (
          <>
            <button type="button" className="danger" onClick={() => onRemove(user.id)}>Confirmar exclusão</button>
            <button type="button" className="secondary" onClick={() => setConfirming(false)}>Não</button>
          </>
        ) : (
          <button type="button" className="danger" onClick={() => setConfirming(true)}>Excluir</button>
        )}
      </td>
    </tr>
  )
}
