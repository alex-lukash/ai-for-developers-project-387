import { describe, expect, it } from 'vitest'
import { formatDateTime, formatDayHeading, formatSlotTime } from './datetime'

const instant = new Date('2026-06-16T09:30:00Z')

describe('formatSlotTime', () => {
  it('formats time in UTC', () => {
    expect(formatSlotTime(instant, 'UTC')).toBe('09:30')
  })

  it('shifts the time into the requested timezone', () => {
    // 09:30 UTC is 05:30 in New York (EDT, UTC-4)
    expect(formatSlotTime(instant, 'America/New_York')).toBe('05:30')
  })
})

describe('formatDayHeading / formatDateTime', () => {
  it('includes the calendar day', () => {
    expect(formatDayHeading(instant, 'UTC')).toMatch(/Jun 16/)
  })

  it('includes both day and time', () => {
    const out = formatDateTime(instant, 'UTC')
    expect(out).toMatch(/Jun 16/)
    expect(out).toMatch(/09:30/)
  })
})

describe('invalid timezones', () => {
  it('falls back to UTC instead of throwing', () => {
    expect(() => formatSlotTime(instant, 'not-a-zone')).not.toThrow()
    expect(formatSlotTime(instant, 'not-a-zone')).toBe('09:30')
    expect(formatDayHeading(instant, 'not-a-zone')).toMatch(/Jun 16/)
    expect(formatDateTime(instant, 'not-a-zone')).toMatch(/09:30/)
  })
})
