import { Link } from 'react-router'
import { useEventTypes } from '@/features/event-types/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function EventTypesPage() {
  const { data: eventTypes, isPending, isError } = useEventTypes(true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Event types</h1>
        <Button asChild>
          <Link to="/admin/event-types/new">New event type</Link>
        </Button>
      </div>

      {isPending && <Skeleton className="h-40 w-full" />}
      {isError && <p className="text-destructive">Could not load event types.</p>}

      {eventTypes && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No event types yet.
                </TableCell>
              </TableRow>
            )}
            {eventTypes.map((et) => (
              <TableRow key={et.id}>
                <TableCell className="font-medium">{et.title}</TableCell>
                <TableCell className="text-muted-foreground">{et.slug}</TableCell>
                <TableCell>{et.durationMinutes} min</TableCell>
                <TableCell>
                  <Badge variant={et.isActive ? 'default' : 'secondary'}>
                    {et.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/admin/event-types/${et.slug}/edit`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
