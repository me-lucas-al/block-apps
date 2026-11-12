export type FakeCognitoUser = {
  sub: string
  username: string
  email: string
  name?: string
  enabled: boolean
  status: string
  groups: Set<string>
  mfaSettingList?: string[]
}

export function buildCognitoError(errorName: string): Error {
  return Object.assign(new Error(errorName), { name: errorName })
}

export function toCognitoRecord(user: FakeCognitoUser) {
  const attributes = [
    { Name: 'sub', Value: user.sub },
    { Name: 'email', Value: user.email },
  ]
  if (user.name) attributes.push({ Name: 'name', Value: user.name })
  return {
    Username: user.username,
    Attributes: attributes,
    UserAttributes: attributes,
    Enabled: user.enabled,
    UserStatus: user.status,
    UserCreateDate: new Date('2026-01-01T00:00:00.000Z'),
    UserMFASettingList: user.mfaSettingList ?? ['SOFTWARE_TOKEN_MFA'],
  }
}

const PAGE_SIZE = 2

export function paginateUsers(users: FakeCognitoUser[], token: string | undefined) {
  const start = Number(token ?? 0)
  const next = start + PAGE_SIZE < users.length ? String(start + PAGE_SIZE) : undefined
  return { users: users.slice(start, start + PAGE_SIZE).map(toCognitoRecord), next }
}

export function listUsersResponse(
  everyone: FakeCognitoUser[],
  input: Record<string, string | undefined>,
) {
  const wantedSub = input['Filter']?.match(/^sub = "(.+)"$/)?.[1]
  const matching = everyone.filter((user) => !wantedSub || user.sub === wantedSub)
  const page = paginateUsers(matching, input['PaginationToken'])
  return { Users: page.users, PaginationToken: page.next }
}
