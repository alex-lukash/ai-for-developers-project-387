import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API } from '@/test/handlers'
import { renderApp } from '@/test/render'

// Guest: "Может посмотреть страницу с видами брони, где доступно название,
// описание и длительность." Only active types are offered to guests.
describe('guest event type list', () => {
  it('shows title, description and duration for active types', async () => {
    renderApp(['/'])

    expect(await screen.findByText('Intro Call')).toBeInTheDocument()
    expect(screen.getByText('A quick chat')).toBeInTheDocument()
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('hides inactive event types from guests', async () => {
    renderApp(['/'])

    // Wait for the list to render, then assert the inactive one is absent.
    await screen.findByText('Intro Call')
    expect(screen.queryByText('Deep Dive')).not.toBeInTheDocument()
  })

  it('navigates to the event type detail when a card is clicked', async () => {
    const user = userEvent.setup()
    renderApp(['/'])

    await user.click(await screen.findByText('Intro Call'))

    // The detail page renders the "Choose a time" heading.
    expect(
      await screen.findByRole('heading', { name: /choose a time/i }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no event types', async () => {
    server.use(http.get(`${API}/event-types`, () => HttpResponse.json([])))
    renderApp(['/'])

    expect(
      await screen.findByText(/no event types available yet/i),
    ).toBeInTheDocument()
  })
})
