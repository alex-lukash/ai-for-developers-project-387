import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { qk } from '@/lib/query-keys'
import type { BookingCreate } from '@/api/generated'

/** All upcoming bookings across every event type, ascending by start. */
export function useBookings() {
  return useQuery({
    queryKey: qk.bookings(),
    queryFn: () => api.listBookings({}),
  })
}

export function useCreateBooking(slug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (bookingCreate: BookingCreate) =>
      api.eventTypesBook({ slug, bookingCreate }),
    onSuccess: () => {
      // The booked slot disappears, and it shows up in the owner's list.
      void qc.invalidateQueries({ queryKey: ['event-types', slug, 'slots'] })
      void qc.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
