import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API, activeEventType } from '@/test/handlers'
import { renderApp } from '@/test/render'

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), 'Intro Call')
  await user.type(screen.getByLabelText('Slug'), 'intro-call')
  await user.type(screen.getByLabelText('Description'), 'A quick chat')
}

describe('event type create', () => {
  it('creates an event type and navigates to the list', async () => {
    const user = userEvent.setup()
    renderApp(['/admin/event-types/new'])

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create event type/i }))

    expect(
      await screen.findByRole('heading', { name: 'Event types' }),
    ).toBeInTheDocument()
  })

  it('shows a slug field error on 409 slug_taken', async () => {
    server.use(
      http.post(`${API}/event-types`, () =>
        HttpResponse.json(
          { error: { code: 'slug_taken', message: 'taken' } },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(['/admin/event-types/new'])

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create event type/i }))

    expect(await screen.findByText(/already taken/i)).toBeInTheDocument()
  })

  it('blocks submit and shows validation errors when empty', async () => {
    const user = userEvent.setup()
    renderApp(['/admin/event-types/new'])

    await user.click(screen.getByRole('button', { name: /create event type/i }))

    expect((await screen.findAllByText('Required')).length).toBeGreaterThan(0)
    // Still on the create page (no navigation happened).
    expect(
      screen.getByRole('button', { name: /create event type/i }),
    ).toBeInTheDocument()
  })

  // Owner sets the duration in minutes for each event type; it must reach the API.
  it('sends the chosen duration to the API', async () => {
    let sentDuration: unknown
    server.use(
      http.post(`${API}/event-types`, async ({ request }) => {
        const body = (await request.json()) as { duration_minutes?: number }
        sentDuration = body.duration_minutes
        return HttpResponse.json(activeEventType, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    renderApp(['/admin/event-types/new'])

    await fillValidForm(user)
    const duration = screen.getByLabelText(/duration/i)
    await user.clear(duration)
    await user.type(duration, '45')
    await user.click(screen.getByRole('button', { name: /create event type/i }))

    expect(
      await screen.findByRole('heading', { name: 'Event types' }),
    ).toBeInTheDocument()
    expect(sentDuration).toBe(45)
  })

  it('blocks submit when the duration is left empty', async () => {
    const user = userEvent.setup()
    renderApp(['/admin/event-types/new'])

    await fillValidForm(user)
    await user.clear(screen.getByLabelText(/duration/i))
    await user.click(screen.getByRole('button', { name: /create event type/i }))

    // A required duration is enforced; the form stays put (no navigation).
    expect(await screen.findByText('Required')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create event type/i }),
    ).toBeInTheDocument()
  })
})
