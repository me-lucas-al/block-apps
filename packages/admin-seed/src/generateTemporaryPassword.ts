import { randomInt } from 'node:crypto'

const PASSWORD_LENGTH = 20
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

export function generateTemporaryPassword(): string {
  return Array.from({ length: PASSWORD_LENGTH }, () =>
    PASSWORD_ALPHABET.charAt(randomInt(PASSWORD_ALPHABET.length)),
  ).join('')
}
