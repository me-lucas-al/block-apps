import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HostAccessNotice } from '../HostAccessNotice'

function renderNotice(granted: boolean | null): string {
  return renderToStaticMarkup(<HostAccessNotice granted={granted} onRequestAccess={() => {}} />)
}

describe('HostAccessNotice', () => {
  it('shows the warning with the request button when access is revoked', () => {
    const markup = renderNotice(false)

    expect(markup).toContain('Acesso aos sites desativado.')
    expect(markup).toContain('Conceder acesso')
  })

  it('stays hidden while the permission is unknown', () => {
    expect(renderNotice(null)).toBe('')
  })

  it('stays hidden when access is granted', () => {
    expect(renderNotice(true)).toBe('')
  })
})
