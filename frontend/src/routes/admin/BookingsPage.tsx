import { useBookings } from '@/features/bookings/api'
import { useOwner } from '@/features/owner/api'
import { formatDateTime } from '@/lib/datetime'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function BookingsPage() {
  const { data: bookings, isPending, isError } = useBookings()
  const { data: owner } = useOwner()
  const timezone = owner?.timezone ?? 'UTC'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Upcoming bookings</h1>
        <p className="text-muted-foreground">
          All reservations across every event type, soonest first.
        </p>
      </div>

      {isPending && <Skeleton className="h-40 w-full" />}
      {isError && <p className="text-destructive">Could not load bookings.</p>}

      {bookings && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Event type</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No upcoming bookings.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">
                  {formatDateTime(b.startAt, timezone)}
                </TableCell>
                <TableCell>{b.eventType.title}</TableCell>
                <TableCell>{b.guestName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {b.guestEmail}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
