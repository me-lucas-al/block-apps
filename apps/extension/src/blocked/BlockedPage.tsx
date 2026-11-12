function readQueryParameter(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

function BlockedKeywordMessage({ blockedKeyword }: { blockedKeyword: string }) {
  return (
    <>
      <h1>Busca bloqueada</h1>
      <p>
        Pesquisar por <strong>{blockedKeyword}</strong> está bloqueado agora pelas suas regras.
      </p>
    </>
  )
}

function BlockedSiteMessage({ blockedSite }: { blockedSite: string }) {
  return (
    <>
      <h1>Site bloqueado</h1>
      <p>
        <strong>{blockedSite}</strong> está bloqueado agora pelas suas regras.
      </p>
    </>
  )
}

export function BlockedPage() {
  const blockedKeyword = readQueryParameter('keyword')

  return (
    <main className="blocked">
      {blockedKeyword ? (
        <BlockedKeywordMessage blockedKeyword={blockedKeyword} />
      ) : (
        <BlockedSiteMessage blockedSite={readQueryParameter('site') ?? 'este site'} />
      )}
      <p className="hint">Volte quando estiver dentro do horário permitido.</p>
    </main>
  )
}
