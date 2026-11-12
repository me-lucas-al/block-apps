import { ListUsersCommand, ListUsersInGroupCommand } from '@aws-sdk/client-cognito-identity-provider'
import type { CognitoUserRecord } from './mapDirectoryUser'
import type { CognitoContext } from './CognitoContext'

export async function listAllUsers(context: CognitoContext): Promise<CognitoUserRecord[]> {
  const users: CognitoUserRecord[] = []
  let paginationToken: string | undefined
  do {
    const page = await context.client.send(
      new ListUsersCommand({ UserPoolId: context.userPoolId, PaginationToken: paginationToken }),
    )
    users.push(...(page.Users ?? []))
    paginationToken = page.PaginationToken
  } while (paginationToken)
  return users
}

export async function listAdminUsers(context: CognitoContext): Promise<CognitoUserRecord[]> {
  const admins: CognitoUserRecord[] = []
  let nextToken: string | undefined
  do {
    const page = await context.client.send(
      new ListUsersInGroupCommand({
        UserPoolId: context.userPoolId,
        GroupName: context.groupNames.admin,
        NextToken: nextToken,
      }),
    )
    admins.push(...(page.Users ?? []))
    nextToken = page.NextToken
  } while (nextToken)
  return admins
}
