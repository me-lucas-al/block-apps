function readBlockedSite(): string {
  return new URLSearchParams(window.location.search).get('site') ?? 'este site'
}

export function BlockedPage() {
  return (
    <main className="blocked">
      <h1>Site bloqueado</h1>
      <p>
        <strong>{readBlockedSite()}</strong> está bloqueado agora pelas suas regras.
      </p>
      <p className="hint">Volte quando estiver dentro do horário permitido.</p>
    </main>
  )
}
