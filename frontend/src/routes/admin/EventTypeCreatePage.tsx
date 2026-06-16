import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { EventTypeForm } from '@/features/event-types/EventTypeForm'

export function EventTypeCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Event types
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">New event type</h1>
      </div>

      <EventTypeForm
        onCreated={(created) => {
          toast.success(`Created "${created.title}".`)
          void navigate('/admin')
        }}
      />
    </div>
  )
}
