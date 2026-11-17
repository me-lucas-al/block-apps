import { describe, expect, it } from 'vitest'
import { buildKit, REMOVAL, STRICT_RULE } from './strictModeKit'

describe('StrictModeController actions', () => {
  it('turns on by creating an always-on protection rule and syncing the device', async () => {
    const { controller, calls } = buildKit([])
    await controller.turnOn()
    expect(calls).toEqual(['create:protection:ios-deny-app-removal:always', 'sync'])
  })

  it('does not create a second rule when it is already on', async () => {
    const { controller, calls } = buildKit([STRICT_RULE])
    await controller.turnOn()
    expect(calls).toEqual([])
  })

  it('turns off only through a removal request, which waits for the cooldown', async () => {
    const { controller, calls } = buildKit([STRICT_RULE])
    await controller.requestTurnOff()
    expect(calls).toEqual([`remove:${STRICT_RULE.id}`, 'sync'])
  })

  it('does nothing when asked to turn off while it is already off', async () => {
    const { controller, calls } = buildKit([])
    await controller.requestTurnOff()
    await controller.cancelTurnOff()
    expect(calls).toEqual([])
  })

  it('cancels a pending turn off', async () => {
    const { controller, calls } = buildKit([STRICT_RULE], [REMOVAL])
    await controller.cancelTurnOff()
    expect(calls).toEqual([`cancel:${STRICT_RULE.id}`, 'sync'])
  })
})
