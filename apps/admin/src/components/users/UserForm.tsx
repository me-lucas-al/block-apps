import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UserRole } from '../../ports/userTypes'
import type { UserFormState } from '../../users/userForm'

type UserFormProps = {
  mode: 'create' | 'edit'
  initial: UserFormState
  onSubmit: (form: UserFormState) => Promise<void>
  onCancel: () => void
}

export function UserForm({ mode, initial, onSubmit, onCancel }: UserFormProps) {
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const updateFormField = <Key extends keyof UserFormState>(key: Key, value: UserFormState[Key]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submitUserForm = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
  }

  return (
    <form className="card stack" onSubmit={submitUserForm}>
      <h2>{mode === 'create' ? 'Novo usuário' : 'Editar usuário'}</h2>
      <label>
        E-mail
        <input
          type="email"
          required
          disabled={mode === 'edit'}
          value={form.email}
          onChange={(e) => updateFormField('email', e.target.value)}
        />
      </label>
      <label>
        Nome
        <input
          value={form.displayName}
          maxLength={80}
          onChange={(e) => updateFormField('displayName', e.target.value)}
        />
      </label>
      <div className="row">
        <label>
          Papel
          <select value={form.role} onChange={(e) => updateFormField('role', e.target.value as UserRole)}>
            <option value="user">Usuário comum</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <label>
          Cooldown (horas)
          <input
            type="number"
            min={0}
            max={168}
            required
            value={form.cooldownHours}
            onChange={(e) => updateFormField('cooldownHours', e.target.value)}
          />
        </label>
      </div>
      {mode === 'create' ? (
        <p className="hint">O usuário receberá um convite por e-mail com senha temporária.</p>
      ) : (
        <label className="check">
          <input
            type="checkbox"
            checked={form.mustChangePassword}
            onChange={(e) => updateFormField('mustChangePassword', e.target.checked)}
          />
          Forçar redefinição de senha no próximo acesso
        </label>
      )}
      <div className="row">
        <button type="submit" disabled={submitting}>Salvar</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
