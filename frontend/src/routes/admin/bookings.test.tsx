import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API, bookingFixture } from '@/test/handlers'
import { renderApp } from '@/test/render'

// Owner: "Просматривает страницу предстоящих встреч, где в одном списке показаны
// бронирования всех типов событий."
describe('owner upcoming bookings', () => {
  it('lists bookings of every event type in one list', async () => {
    const secondBooking = {
      id: 100,
      event_type: { id: 2, slug: 'deep-dive', title: 'Deep Dive', duration_minutes: 60 },
      start_at: '2026-06-17T13:00:00Z',
      end_at: '2026-06-17T14:00:00Z',
      guest_name: 'Alan Turing',
      guest_email: 'alan@example.com',
      created_at: '2026-06-10T00:00:00Z',
    }
    server.use(
      http.get(`${API}/bookings`, () =>
        HttpResponse.json([bookingFixture, secondBooking]),
      ),
    )
    renderApp(['/admin/bookings'])

    // Both event types appear together in the single combined list.
    expect(await screen.findByText('Intro Call')).toBeInTheDocument()
    expect(screen.getByText('Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument()
    expect(screen.getByText('Alan Turing')).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
    expect(screen.getByText('alan@example.com')).toBeInTheDocument()
  })

  it('shows an empty state when there are no bookings', async () => {
    server.use(http.get(`${API}/bookings`, () => HttpResponse.json([])))
    renderApp(['/admin/bookings'])

    expect(
      await screen.findByText(/no upcoming bookings/i),
    ).toBeInTheDocument()
  })

  it('shows an error state when bookings fail to load', async () => {
    server.use(
      http.get(`${API}/bookings`, () => new HttpResponse(null, { status: 500 })),
    )
    renderApp(['/admin/bookings'])

    expect(
      await screen.findByText(/could not load bookings/i),
    ).toBeInTheDocument()
  })
})
