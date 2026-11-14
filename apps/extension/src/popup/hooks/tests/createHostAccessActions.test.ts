import { describe, expect, it, vi } from 'vitest'
import type { HostAccessPort } from '../../../ports/browser/HostAccessPort'
import { createHostAccessActions } from '../createHostAccessActions'

function createPort(isGranted: boolean, requestResult: boolean): HostAccessPort {
  return { isGranted: async () => isGranted, requestAccess: async () => requestResult }
}

describe('createHostAccessActions', () => {
  it('reports the current permission when loading', async () => {
    const onGrantedChange = vi.fn()

    await createHostAccessActions(createPort(false, true), onGrantedChange).loadGrantedState()

    expect(onGrantedChange).toHaveBeenCalledWith(false)
  })

  it('reports the answer of the permission prompt', async () => {
    const onGrantedChange = vi.fn()

    await createHostAccessActions(createPort(false, true), onGrantedChange).requestAccess()

    expect(onGrantedChange).toHaveBeenCalledWith(true)
  })

  it('keeps access off when the user refuses the prompt', async () => {
    const onGrantedChange = vi.fn()

    await createHostAccessActions(createPort(false, false), onGrantedChange).requestAccess()

    expect(onGrantedChange).toHaveBeenCalledWith(false)
  })
})
