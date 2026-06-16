import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { qk } from '@/lib/query-keys'

/** Free slots for an event type, grouped by day, for the 14-day window. */
export function useSlots(slug: string) {
  return useQuery({
    queryKey: qk.slots(slug),
    queryFn: () => api.eventTypesSlots({ slug }),
    enabled: Boolean(slug),
  })
}
