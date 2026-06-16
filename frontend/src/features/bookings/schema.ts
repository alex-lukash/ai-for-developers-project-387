import { z } from 'zod'

/** Guest contact fields. `start_at` comes from the selected slot, not the form. */
export const bookingSchema = z.object({
  guestName: z.string().min(1, 'Required'),
  guestEmail: z.email('Enter a valid email'),
})

export type BookingForm = z.infer<typeof bookingSchema>
