import { Link, useLocation } from 'react-router'
import { CircleCheckIcon } from 'lucide-react'
import type { Booking } from '@/api/generated'
import { useOwner } from '@/features/owner/api'
import { formatDateTime } from '@/lib/datetime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function BookingConfirmationPage() {
  const location = useLocation()
  const { data: owner } = useOwner()
  const booking = (location.state as { booking?: Booking } | null)?.booking

  if (!booking) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Booking details are no longer available.
        </p>
        <Button asChild>
          <Link to="/">Back to event types</Link>
        </Button>
      </div>
    )
  }

  const timezone = owner?.timezone ?? 'UTC'

  return (
    <Card className="mx-auto max-w-md text-center">
      <CardHeader>
        <CircleCheckIcon className="mx-auto size-10 text-green-600" />
        <CardTitle>You're booked!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">{booking.eventType.title}</p>
        <p className="text-muted-foreground">
          {formatDateTime(booking.startAt, timezone)}
        </p>
        <p className="text-sm text-muted-foreground">
          A confirmation was prepared for {booking.guestEmail}.
        </p>
        <div className="pt-4">
          <Button asChild variant="outline">
            <Link to="/">Book another</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
