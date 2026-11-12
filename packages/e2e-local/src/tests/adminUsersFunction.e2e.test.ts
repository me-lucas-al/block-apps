import { beforeAll, describe, expect, it } from 'vitest'
import { callAdminUsersFunction } from '../harness/callAdminUsersFunction.ts'
import {
  type SignedInAccount,
  createClientWithoutSession,
  createSignedInAdmin,
  signIn,
} from '../harness/createSignedInAccounts.ts'
import { readLocalStackSettings } from '../harness/readLocalStackSettings.ts'

const settings = readLocalStackSettings(process.env)

describe.skipIf(!settings)('admin-users function on the local stack', () => {
  let admin: SignedInAccount
  const commonUserEmail = `common-${Date.now()}@e2e.local`

  beforeAll(async () => {
    admin = await createSignedInAdmin(settings!)
  })

  const sendAsAdmin = (requestBody: object) => callAdminUsersFunction(settings!, admin, requestBody)

  it('rejects calls without a session', async () => {
    const anonymousReply = await fetch(`${settings!.apiUrl}/functions/v1/admin-users`, {
      method: 'POST',
      headers: { apikey: settings!.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    })
    expect(anonymousReply.status).toBe(401)
  })

  it('lets an admin create, list, update and delete a common user', async () => {
    const created = await sendAsAdmin({
      action: 'create',
      user: { email: commonUserEmail, password: 'common-password-1', displayName: 'Common' },
    })
    expect(created.status).toBe(200)
    const commonUserId = created.body.user.id as string
    expect(created.body.user).toMatchObject({ role: 'user', mustChangePassword: true })

    const listed = await sendAsAdmin({ action: 'list' })
    expect(listed.body.users.map((user: { email: string }) => user.email)).toContain(commonUserEmail)

    const updated = await sendAsAdmin({
      action: 'update',
      id: commonUserId,
      user: { displayName: 'Renamed', cooldownHours: 48, mustChangePassword: false },
    })
    expect(updated.body.user).toMatchObject({ displayName: 'Renamed', cooldownHours: 48 })

    const removed = await sendAsAdmin({ action: 'delete', id: commonUserId })
    expect(removed.body).toEqual({ ok: true })
    await expect(signIn(settings!, commonUserEmail, 'common-password-1')).rejects.toThrow()
  })

  it('refuses a common user on every action', async () => {
    const email = `refused-${Date.now()}@e2e.local`
    await sendAsAdmin({ action: 'create', user: { email, password: 'common-password-1' } })
    const commonUser = await signIn(settings!, email, 'common-password-1')
    const reply = await callAdminUsersFunction(settings!, commonUser, { action: 'list' })
    expect(reply.status).toBe(403)
  })

  it('does not let an admin delete themselves and reports duplicated emails', async () => {
    const selfDeletion = await sendAsAdmin({ action: 'delete', id: admin.userId })
    expect(selfDeletion.status).toBe(409)

    const duplicate = await sendAsAdmin({
      action: 'create',
      user: { email: admin.email, password: 'common-password-1' },
    })
    expect(duplicate.status).toBe(409)
  })

  it('lets only admins read other profiles through the data API', async () => {
    const email = `profile-${Date.now()}@e2e.local`
    await sendAsAdmin({ action: 'create', user: { email, password: 'common-password-1' } })
    const commonUser = await signIn(settings!, email, 'common-password-1')

    const profilesSeenByCommonUser = await commonUser.client.from('profiles').select('id')
    expect(profilesSeenByCommonUser.data).toHaveLength(1)
    const profilesSeenByAdmin = await admin.client.from('profiles').select('id')
    expect(profilesSeenByAdmin.data!.length).toBeGreaterThan(1)

    const anonymousRead = await createClientWithoutSession(settings!).from('profiles').select('id')
    expect(anonymousRead.error?.code).toBe('42501')
  })
})
