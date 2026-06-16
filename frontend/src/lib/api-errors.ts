import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ResponseError } from '@/api/generated'

/** The shared error envelope from the API: { error: { code, message, fields? } }. */
export interface ApiErrorEnvelope {
  code: string
  message: string
  fields?: Record<string, string[]>
}

/**
 * Extract the API error envelope from a thrown error. The generated client
 * throws `ResponseError` carrying the raw `Response`; we read its JSON body.
 * Returns null for network errors or non-enveloped responses.
 */
export async function parseApiError(err: unknown): Promise<ApiErrorEnvelope | null> {
  if (!(err instanceof ResponseError)) return null
  try {
    const body = await err.response.clone().json()
    if (body && typeof body === 'object' && 'error' in body) {
      return (body as { error: ApiErrorEnvelope }).error
    }
  } catch {
    // body was not JSON
  }
  return null
}

function snakeToCamel(field: string): string {
  return field.replace(/_([a-z])/g, (_m, c: string) => c.toUpperCase())
}

/**
 * Apply per-field validation messages from a `validation_failed` envelope onto
 * a react-hook-form. API field names are snake_case; form fields are camelCase,
 * so keys are converted before `setError`.
 */
export function applyFieldErrors<T extends FieldValues>(
  envelope: ApiErrorEnvelope,
  setError: UseFormSetError<T>,
): void {
  if (!envelope.fields) return
  for (const [field, messages] of Object.entries(envelope.fields)) {
    setError(snakeToCamel(field) as Path<T>, { message: messages.join(' ') })
  }
}
