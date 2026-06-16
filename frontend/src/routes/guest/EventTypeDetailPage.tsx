import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import type { Booking, Slot } from '@/api/generated'
import { useEventType } from '@/features/event-types/api'
import { useSlots } from '@/features/slots/api'
import { SlotPicker } from '@/features/slots/SlotPicker'
import { BookingForm } from '@/features/bookings/BookingForm'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function EventTypeDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const eventType = useEventType(slug)
  const slots = useSlots(slug)
  const [selected, setSelected] = useState<Slot | null>(null)

  const timezone = slots.data?.timezone ?? 'UTC'

  function handleBooked(booking: Booking) {
    setSelected(null)
    navigate(`/e/${slug}/confirmed/${booking.id}`, { state: { booking } })
  }

  if (eventType.isError) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">This event type was not found.</p>
        <Link to="/" className="text-sm underline">
          Back to all event types
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All event types
        </Link>
        {eventType.isPending ? (
          <Skeleton className="mt-3 h-8 w-48" />
        ) : (
          <>
            <h1 className="mt-3 text-2xl font-semibold">
              {eventType.data.title}
            </h1>
            <p className="text-muted-foreground">
              {eventType.data.description} · {eventType.data.durationMinutes} min
            </p>
          </>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Choose a time</h2>
        {slots.isPending && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        {slots.isError && (
          <p className="text-destructive">Could not load availability.</p>
        )}
        {slots.data && (
          <SlotPicker
            days={slots.data.days}
            timezone={timezone}
            selectedStartAt={selected?.startAt.toISOString()}
            onSelect={setSelected}
          />
        )}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your details</DialogTitle>
            <DialogDescription>
              Enter your name and email to book this slot.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <BookingForm
              slug={slug}
              slot={selected}
              timezone={timezone}
              onBooked={handleBooked}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
