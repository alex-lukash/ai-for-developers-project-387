import { describe, expect, it, vi } from 'vitest'
import { ResponseError } from '@/api/generated'
import { applyFieldErrors, parseApiError } from './api-errors'

describe('parseApiError', () => {
  it('extracts the envelope from a ResponseError body', async () => {
    const body = { error: { code: 'slug_taken', message: 'taken' } }
    const err = new ResponseError(
      new Response(JSON.stringify(body), { status: 409 }),
    )
    expect(await parseApiError(err)).toEqual(body.error)
  })

  it('returns null for a plain Error', async () => {
    expect(await parseApiError(new Error('boom'))).toBeNull()
  })

  it('returns null for a non-enveloped response', async () => {
    const err = new ResponseError(new Response('not json', { status: 500 }))
    expect(await parseApiError(err)).toBeNull()
  })
})

describe('applyFieldErrors', () => {
  it('maps snake_case field names to camelCase setError calls', () => {
    const setError = vi.fn()
    applyFieldErrors(
      {
        code: 'validation_failed',
        message: 'bad',
        fields: {
          duration_minutes: ['Must be at least 1'],
          guest_email: ['Invalid'],
        },
      },
      setError,
    )
    expect(setError).toHaveBeenCalledWith('durationMinutes', {
      message: 'Must be at least 1',
    })
    expect(setError).toHaveBeenCalledWith('guestEmail', { message: 'Invalid' })
  })

  it('is a no-op without a fields map', () => {
    const setError = vi.fn()
    applyFieldErrors({ code: 'validation_failed', message: 'bad' }, setError)
    expect(setError).not.toHaveBeenCalled()
  })
})
