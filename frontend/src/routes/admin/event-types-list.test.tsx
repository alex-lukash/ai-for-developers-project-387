import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API } from '@/test/handlers'
import { renderApp } from '@/test/render'

// Owner manages event types: the admin list shows both active and inactive
// types (the guest list hides inactive ones), with a status badge each.
describe('admin event types list', () => {
  it('shows active and inactive types with status badges', async () => {
    renderApp(['/admin'])

    expect(await screen.findByText('Intro Call')).toBeInTheDocument()
    expect(screen.getByText('Deep Dive')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /new event type/i }),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no event types', async () => {
    server.use(http.get(`${API}/event-types`, () => HttpResponse.json([])))
    renderApp(['/admin'])

    expect(await screen.findByText(/no event types yet/i)).toBeInTheDocument()
  })
})
