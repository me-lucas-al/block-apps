import type { BlockRule } from '@block-apps/core'
import { describe, expect, it } from 'vitest'
import { buildKit, REMOVAL, STRICT_RULE } from './strictModeKit'

describe('StrictModeController state', () => {
  it('reports off when there is no strict mode rule', async () => {
    const otherRules: BlockRule[] = [
      { ...STRICT_RULE, id: 'a', target: 'something-else' },
      { ...STRICT_RULE, id: 'b', targetType: 'site' },
    ]
    expect(await buildKit(otherRules).controller.readState()).toEqual({ status: 'off' })
  })

  it('does not count a protection rule that follows a schedule', async () => {
    const scheduled: BlockRule = { ...STRICT_RULE, mode: 'schedule' }
    expect(await buildKit([scheduled]).controller.readState()).toEqual({ status: 'off' })
  })

  it('reports on when the rule exists without a pending removal', async () => {
    expect(await buildKit([STRICT_RULE]).controller.readState()).toEqual({ status: 'on' })
  })

  it('reports that this device still has to accept the warning', async () => {
    const kit = buildKit([STRICT_RULE], [], true, false)
    expect(await kit.controller.readState()).toEqual({ status: 'needsAcceptance' })
  })

  it('reports turning off with the cooldown end when a removal is pending', async () => {
    const state = await buildKit([STRICT_RULE], [REMOVAL]).controller.readState()
    expect(state).toEqual({ status: 'turningOff', removal: REMOVAL })
  })

  it('ignores pending changes that are not removals of the strict rule', async () => {
    const otherChange = { ...REMOVAL, ruleId: 'other' }
    const updateChange = { ...REMOVAL, kind: 'update' as const }
    const state = await buildKit([STRICT_RULE], [otherChange, updateChange]).controller.readState()
    expect(state).toEqual({ status: 'on' })
  })
})
