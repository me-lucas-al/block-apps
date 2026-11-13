import type { ReactNode } from 'react'
import { useSignOut } from '../../hooks/useSignOut'

export type Page = 'users' | 'account'

type AppShellProps = {
  email: string
  page: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

export function AppShell({ email, page, onNavigate, children }: AppShellProps) {
  const signOut = useSignOut()

  return (
    <div className="shell">
      <nav className="row between">
        <div className="row">
          <strong>Block Apps</strong>
          <button type="button" className={page === 'users' ? '' : 'secondary'} onClick={() => onNavigate('users')}>
            Usuários
          </button>
          <button type="button" className={page === 'account' ? '' : 'secondary'} onClick={() => onNavigate('account')}>
            Minha conta
          </button>
        </div>
        <div className="row">
          <span className="hint">{email}</span>
          <button type="button" className="secondary" onClick={() => void signOut()}>Sair</button>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
