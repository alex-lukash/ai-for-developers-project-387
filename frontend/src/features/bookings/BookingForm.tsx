import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { Booking, Slot } from '@/api/generated'
import { bookingSchema, type BookingForm as BookingFormValues } from './schema'
import { useCreateBooking } from './api'
import { applyFieldErrors, parseApiError } from '@/lib/api-errors'
import { formatDateTime } from '@/lib/datetime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface BookingFormProps {
  slug: string
  slot: Slot
  timezone: string
  onBooked: (booking: Booking) => void
}

export function BookingForm({
  slug,
  slot,
  timezone,
  onBooked,
}: BookingFormProps) {
  const qc = useQueryClient()
  const createBooking = useCreateBooking(slug)
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { guestName: '', guestEmail: '' },
  })

  const refetchSlots = () =>
    qc.invalidateQueries({ queryKey: ['event-types', slug, 'slots'] })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const booking = await createBooking.mutateAsync({
        startAt: slot.startAt,
        guestName: values.guestName,
        guestEmail: values.guestEmail,
      })
      onBooked(booking)
    } catch (err) {
      const envelope = await parseApiError(err)
      if (envelope?.code === 'validation_failed') {
        applyFieldErrors(envelope, form.setError)
        return
      }
      // slot_taken (409) or slot_in_past / slot_out_of_window / slot_not_on_grid:
      // the chosen slot is no longer valid — surface it and refresh availability.
      toast.error(
        envelope?.code === 'slot_taken'
          ? 'That slot was just taken. Please pick another.'
          : (envelope?.message ?? 'Could not book this slot.'),
      )
      void refetchSlots()
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {formatDateTime(slot.startAt, timezone)}
        </p>
        <FormField
          control={form.control}
          name="guestName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ada Lovelace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guestEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ada@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={createBooking.isPending}
          className="w-full"
        >
          {createBooking.isPending ? 'Booking…' : 'Confirm booking'}
        </Button>
      </form>
    </Form>
  )
}
