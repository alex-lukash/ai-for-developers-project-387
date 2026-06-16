import { useEventTypes } from '@/features/event-types/api'
import { EventTypeCard } from '@/features/event-types/EventTypeCard'
import { Skeleton } from '@/components/ui/skeleton'

export function EventTypeListPage() {
  const { data: eventTypes, isPending, isError } = useEventTypes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pick a meeting type</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to meet, then grab a free slot.
        </p>
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-destructive">Could not load event types.</p>
      )}

      {eventTypes && eventTypes.length === 0 && (
        <p className="text-muted-foreground">No event types available yet.</p>
      )}

      {eventTypes && eventTypes.length > 0 && (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <EventTypeCard key={et.id} eventType={et} />
          ))}
        </div>
      )}
    </div>
  )
}
