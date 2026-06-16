import { z } from 'zod'

/** Create form: slug is required and URL-safe; duration is a positive integer. */
export const eventTypeCreateSchema = z.object({
  slug: z
    .string()
    .min(1, 'Required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and dashes only'),
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  durationMinutes: z
    .number({ error: 'Required' })
    .int('Whole minutes only')
    .min(1, 'Must be at least 1 minute'),
})

export type EventTypeCreateForm = z.infer<typeof eventTypeCreateSchema>

/** Edit form: no slug (immutable), plus the active toggle. */
export const eventTypeUpdateSchema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  durationMinutes: z
    .number({ error: 'Required' })
    .int('Whole minutes only')
    .min(1, 'Must be at least 1 minute'),
  isActive: z.boolean(),
})

export type EventTypeUpdateForm = z.infer<typeof eventTypeUpdateSchema>
