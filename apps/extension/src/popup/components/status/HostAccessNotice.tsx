type HostAccessNoticeProps = {
  readonly granted: boolean | null
  readonly onRequestAccess: () => void
}

export function HostAccessNotice({ granted, onRequestAccess }: HostAccessNoticeProps) {
  if (granted !== false) return null

  return (
    <div className="warning" role="alert">
      <strong>Acesso aos sites desativado.</strong>
      <p>
        Sem acesso a todos os sites a extensão não consegue bloquear nada.
        Conceda a permissão para ativar o bloqueio.
      </p>
      <button type="button" onClick={onRequestAccess}>
        Conceder acesso
      </button>
    </div>
  )
}
