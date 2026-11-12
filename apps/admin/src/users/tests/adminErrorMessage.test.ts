import { describe, expect, it } from 'vitest'
import { ApiError } from '@block-apps/api'
import { describeFailure } from '../adminErrorMessage'

describe('describeFailure', () => {
  it('translates 401 unauthenticated error', () => {
    expect(describeFailure(new ApiError(401, 'Unauthorized'))).toBe('Sua sessão expirou. Entre novamente.')
  })

  it('translates 403 forbidden errors', () => {
    expect(describeFailure(new ApiError(403, 'admin TOTP MFA required'))).toBe(
      'Administradores devem ter autenticação em duas etapas (MFA) ativada.',
    )
    expect(describeFailure(new ApiError(403, 'change the temporary password first'))).toBe(
      'Troque a senha temporária antes de administrar usuários.',
    )
    expect(describeFailure(new ApiError(403, 'Forbidden'))).toBe('Você não tem permissão de administrador.')
  })

  it('translates 404 not found error', () => {
    expect(describeFailure(new ApiError(404, 'User not found'))).toBe(
      'Usuário não encontrado. A lista foi atualizada.',
    )
  })

  it('translates 409 conflict errors', () => {
    expect(describeFailure(new ApiError(409, 'at least one admin must remain'))).toBe(
      'É preciso manter ao menos um administrador.',
    )
    expect(describeFailure(new ApiError(409, 'cannot delete self'))).toBe(
      'Você não pode excluir nem rebaixar a própria conta.',
    )
    expect(describeFailure(new ApiError(409, 'user already exists'))).toBe(
      'Já existe um usuário com esse e-mail.',
    )
  })

  it('translates 400 validation error', () => {
    expect(describeFailure(new ApiError(400, 'Invalid input'))).toBe('Confira os campos enviados.')
  })

  it('falls back to standard Error message or unexpected string', () => {
    expect(describeFailure(new Error('network down'))).toBe('network down')
    expect(describeFailure('boom')).toBe('Erro inesperado')
  })
})
