import { describe, expect, it } from 'vitest'
import { eventTypeCreateSchema } from './schema'
import { bookingSchema } from '@/features/bookings/schema'

describe('eventTypeCreateSchema', () => {
  it('accepts valid input', () => {
    const result = eventTypeCreateSchema.safeParse({
      slug: 'intro-call',
      title: 'Intro',
      description: 'A chat',
      durationMinutes: 30,
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid slug', () => {
    const result = eventTypeCreateSchema.safeParse({
      slug: 'Not A Slug',
      title: 'Intro',
      description: 'A chat',
      durationMinutes: 30,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a non-positive duration', () => {
    const result = eventTypeCreateSchema.safeParse({
      slug: 'intro',
      title: 'Intro',
      description: 'A chat',
      durationMinutes: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('bookingSchema', () => {
  it('requires a valid email', () => {
    expect(
      bookingSchema.safeParse({ guestName: 'Ada', guestEmail: 'nope' }).success,
    ).toBe(false)
    expect(
      bookingSchema.safeParse({ guestName: 'Ada', guestEmail: 'ada@x.com' })
        .success,
    ).toBe(true)
  })

  it('requires a name', () => {
    expect(
      bookingSchema.safeParse({ guestName: '', guestEmail: 'ada@x.com' })
        .success,
    ).toBe(false)
  })
})
