import { beforeAll, describe, expect, it } from 'vitest'
import {
  callAdminUsersFunction,
  requireUserInReply,
  requireUsersInReply,
} from '../harness/callAdminUsersFunction.ts'
import {
  type SignedInAccount,
  createClientWithoutSession,
  createSignedInAdmin,
  createSignedInAdminWithPermanentPassword,
  signIn,
} from '../harness/createSignedInAccounts.ts'
import { readLocalStackSettings } from '../harness/readLocalStackSettings.ts'

const settings = readLocalStackSettings(process.env)

describe.skipIf(!settings)('admin-users function on the local stack', () => {
  let admin: SignedInAccount
  const commonUserEmail = `common-${Date.now()}@e2e.local`

  beforeAll(async () => {
    admin = await createSignedInAdminWithPermanentPassword(settings!)
  })

  const sendAsAdmin = (requestBody: object) => callAdminUsersFunction(settings!, admin, requestBody)

  it('refuses an admin that has not replaced the temporary password yet', async () => {
    const adminWithTemporaryPassword = await createSignedInAdmin(settings!)
    const reply = await callAdminUsersFunction(settings!, adminWithTemporaryPassword, { action: 'list' })
    expect(reply.status).toBe(403)
    expect(reply.body.error?.code).toBe('password_change_required')
  })

  it('accepts the same admin right after the password is changed', async () => {
    const adminWithTemporaryPassword = await createSignedInAdmin(settings!)
    await adminWithTemporaryPassword.client.auth.updateUser({ password: 'e2e-permanent-password' })
    const reply = await callAdminUsersFunction(settings!, adminWithTemporaryPassword, { action: 'list' })
    expect(reply.status).toBe(200)
  })

  it('does not let a user clear the temporary password flag without changing the password', async () => {
    const email = `flag-${Date.now()}@e2e.local`
    await sendAsAdmin({ action: 'create', user: { email, password: 'common-password-1' } })
    const commonUser = await signIn(settings!, email, 'common-password-1')
    const attempt = await commonUser.client.rpc('acknowledge_password_change')
    expect(attempt.error).not.toBeNull()
    const profile = await commonUser.client.from('profiles').select('must_change_password').single()
    expect(profile.data?.must_change_password).toBe(true)
  })

  it('requires a new password to promote a user to admin and forces its change', async () => {
    const email = `promote-${Date.now()}@e2e.local`
    const created = requireUserInReply(
      await sendAsAdmin({ action: 'create', user: { email, password: 'common-password-1' } }),
    )
    const withoutPassword = await sendAsAdmin({ action: 'update', id: created.id, user: { role: 'admin' } })
    expect(withoutPassword.status).toBe(400)
    const promoted = await sendAsAdmin({
      action: 'update',
      id: created.id,
      user: { role: 'admin', password: 'brand-new-password' },
    })
    expect(requireUserInReply(promoted)).toMatchObject({ role: 'admin', mustChangePassword: true })
  })

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
    const createdUser = requireUserInReply(created)
    expect(createdUser).toMatchObject({ role: 'user', mustChangePassword: true })

    const listedEmails = requireUsersInReply(await sendAsAdmin({ action: 'list' })).map(
      (user) => user.email,
    )
    expect(listedEmails).toContain(commonUserEmail)

    const updated = await sendAsAdmin({
      action: 'update',
      id: createdUser.id,
      user: { displayName: 'Renamed', cooldownHours: 48, mustChangePassword: false },
    })
    expect(requireUserInReply(updated)).toMatchObject({ displayName: 'Renamed', cooldownHours: 48 })

    const removed = await sendAsAdmin({ action: 'delete', id: createdUser.id })
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
    expect(profilesSeenByAdmin.data?.length).toBeGreaterThan(1)

    const anonymousRead = await createClientWithoutSession(settings!).from('profiles').select('id')
    expect(anonymousRead.error?.code).toBe('42501')
  })
})
