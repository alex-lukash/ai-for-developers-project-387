import { Link, useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  eventTypeUpdateSchema,
  type EventTypeUpdateForm,
} from '@/features/event-types/schema'
import { useEventType, useUpdateEventType } from '@/features/event-types/api'
import { applyFieldErrors, parseApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function EventTypeEditPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const eventType = useEventType(slug)
  const updateEventType = useUpdateEventType(slug)

  const form = useForm<EventTypeUpdateForm>({
    resolver: zodResolver(eventTypeUpdateSchema),
    defaultValues: {
      title: '',
      description: '',
      durationMinutes: 30,
      isActive: true,
    },
    values: eventType.data
      ? {
          title: eventType.data.title,
          description: eventType.data.description,
          durationMinutes: eventType.data.durationMinutes,
          isActive: eventType.data.isActive,
        }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateEventType.mutateAsync(values)
      toast.success('Event type updated.')
      void navigate('/admin')
    } catch (err) {
      const envelope = await parseApiError(err)
      if (envelope?.code === 'validation_failed') {
        applyFieldErrors(envelope, form.setError)
        return
      }
      toast.error(envelope?.message ?? 'Could not update event type.')
    }
  })

  if (eventType.isPending) {
    return <Skeleton className="h-64 w-full max-w-lg" />
  }

  if (eventType.isError) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">This event type was not found.</p>
        <Link to="/admin" className="text-sm underline">
          Back to event types
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Event types
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">
          Edit “{eventType.data.title}”
        </h1>
        <p className="text-muted-foreground">/e/{eventType.data.slug}</p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="max-w-lg space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? Number.NaN
                          : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Inactive types are hidden from guests.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateEventType.isPending}>
            {updateEventType.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
