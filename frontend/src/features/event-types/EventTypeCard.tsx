import { Link } from 'react-router'
import { ClockIcon } from 'lucide-react'
import type { EventType } from '@/api/generated'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function EventTypeCard({ eventType }: { eventType: EventType }) {
  return (
    <Link to={`/e/${eventType.slug}`} className="block">
      <Card className="transition-colors hover:border-foreground/30">
        <CardHeader>
          <CardTitle>{eventType.title}</CardTitle>
          <CardDescription>{eventType.description}</CardDescription>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon className="size-4" />
            {eventType.durationMinutes} min
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
