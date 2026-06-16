/**
 * Display helpers. The API returns UTC instants; everything is rendered in the
 * owner's IANA timezone (the app is single-timezone by design — see the spec).
 */

const validTimeZones = new Map<string, string>()

/**
 * Validate an IANA timezone, falling back to UTC when it is unknown. Passing an
 * invalid zone to `Intl.DateTimeFormat` throws a `RangeError`, which would crash
 * the whole render; this keeps formatting safe for unexpected API values.
 */
function resolveTimeZone(timeZone: string): string {
  const cached = validTimeZones.get(timeZone)
  if (cached) return cached
  let resolved: string
  try {
    new Intl.DateTimeFormat(undefined, { timeZone }).format()
    resolved = timeZone
  } catch {
    resolved = 'UTC'
  }
  validTimeZones.set(timeZone, resolved)
  return resolved
}

/** "09:30" — slot start/end time in the owner's timezone. */
export function formatSlotTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: resolveTimeZone(timeZone),
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** "Mon, Jun 16" — day heading for a group of slots. */
export function formatDayHeading(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: resolveTimeZone(timeZone),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/** "Mon, Jun 16, 09:30" — compact date + time, e.g. for booking lists. */
export function formatDateTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: resolveTimeZone(timeZone),
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
