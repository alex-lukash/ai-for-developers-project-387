/**
 * Centralized TanStack Query keys. Keep these in one place so invalidation
 * after mutations stays consistent (e.g. invalidating `['event-types']`
 * matches every list variant).
 */
export const qk = {
  owner: ['owner'] as const,
  eventTypes: (includeInactive?: boolean) =>
    ['event-types', { includeInactive: includeInactive ?? false }] as const,
  eventType: (slug: string) => ['event-types', slug] as const,
  slots: (slug: string, from?: string, to?: string) =>
    ['event-types', slug, 'slots', { from, to }] as const,
  bookings: (from?: string, to?: string) =>
    ['bookings', { from, to }] as const,
}
