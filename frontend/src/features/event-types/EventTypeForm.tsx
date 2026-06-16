import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import type { EventType } from '@/api/generated'
import { eventTypeCreateSchema, type EventTypeCreateForm } from './schema'
import { useCreateEventType } from './api'
import { applyFieldErrors, parseApiError } from '@/lib/api-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface EventTypeFormProps {
  onCreated: (eventType: EventType) => void
}

export function EventTypeForm({ onCreated }: EventTypeFormProps) {
  const createEventType = useCreateEventType()
  const form = useForm<EventTypeCreateForm>({
    resolver: zodResolver(eventTypeCreateSchema),
    defaultValues: {
      slug: '',
      title: '',
      description: '',
      durationMinutes: 30,
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const created = await createEventType.mutateAsync(values)
      onCreated(created)
    } catch (err) {
      const envelope = await parseApiError(err)
      if (envelope?.code === 'validation_failed') {
        applyFieldErrors(envelope, form.setError)
        return
      }
      if (envelope?.code === 'slug_taken') {
        form.setError('slug', { message: 'This slug is already taken.' })
        return
      }
      toast.error(envelope?.message ?? 'Could not create event type.')
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="max-w-lg space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Intro call" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="intro-call" {...field} />
              </FormControl>
              <FormDescription>Used in the booking URL, e.g. /e/intro-call</FormDescription>
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
                <Textarea placeholder="A quick 30-minute intro." {...field} />
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
                      e.target.value === '' ? Number.NaN : e.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createEventType.isPending}>
          {createEventType.isPending ? 'Creating…' : 'Create event type'}
        </Button>
      </form>
    </Form>
  )
}
