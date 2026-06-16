import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { qk } from '@/lib/query-keys'
import type { EventTypeCreate, EventTypeUpdate } from '@/api/generated'

export function useEventTypes(includeInactive = false) {
  return useQuery({
    queryKey: qk.eventTypes(includeInactive),
    queryFn: () => api.eventTypesList({ includeInactive }),
  })
}

export function useEventType(slug: string) {
  return useQuery({
    queryKey: qk.eventType(slug),
    queryFn: () => api.eventTypesRead({ slug }),
    enabled: Boolean(slug),
  })
}

export function useCreateEventType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventTypeCreate: EventTypeCreate) =>
      api.eventTypesCreate({ eventTypeCreate }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['event-types'] })
    },
  })
}

export function useUpdateEventType(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventTypeUpdate: EventTypeUpdate) =>
      api.eventTypesUpdate({ slug, eventTypeUpdate }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['event-types'] })
    },
  })
}

export function useDeleteEventType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => api.eventTypesRemove({ slug }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['event-types'] })
    },
  })
}
