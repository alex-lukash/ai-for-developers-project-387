import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API, slotsFixture } from '@/test/handlers'
import { renderApp } from '@/test/render'

// Guest: "Выбирает тип события, открывает календарь и выбирает свободный слот
// в ближайшие 14 дней."
describe('guest slot picking', () => {
  it('shows a day heading and free slot times', async () => {
    renderApp(['/e/intro-call'])

    // slotsFixture has 2026-06-16 (a Tuesday) with 09:00 and 09:30 slots.
    expect(await screen.findByText(/jun 16/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '09:30' })).toBeInTheDocument()
  })

  it('shows an empty-window message when there are no free slots', async () => {
    server.use(
      http.get(`${API}/event-types/:slug/slots`, () =>
        HttpResponse.json({ ...slotsFixture, days: [] }),
      ),
    )
    renderApp(['/e/intro-call'])

    expect(
      await screen.findByText(/no free slots in the next 14 days/i),
    ).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown event type', async () => {
    server.use(
      http.get(`${API}/event-types/:slug`, () =>
        HttpResponse.json(
          { error: { code: 'event_type_not_found', message: 'Not found' } },
          { status: 404 },
        ),
      ),
    )
    renderApp(['/e/does-not-exist'])

    expect(
      await screen.findByText(/this event type was not found/i),
    ).toBeInTheDocument()
  })
})
