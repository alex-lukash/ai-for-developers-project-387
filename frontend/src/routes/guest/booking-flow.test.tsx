import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { API } from '@/test/handlers'
import { renderApp } from '@/test/render'

describe('guest booking flow', () => {
  it('books a slot and shows the confirmation', async () => {
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    const slot = await screen.findByRole('button', { name: '09:00' })
    await user.click(slot)

    await user.type(await screen.findByLabelText('Name'), 'Grace Hopper')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText(/you're booked/i)).toBeInTheDocument()
  })

  // Busyness rule: "На одно и то же время нельзя создать две записи, даже если
  // это разные типы событий." The server rejects an overlapping interval with
  // 409 slot_taken (e.g. the time is already booked under a different type).
  it('surfaces a toast when the slot was just taken', async () => {
    server.use(
      http.post(`${API}/event-types/:slug/bookings`, () =>
        HttpResponse.json(
          { error: { code: 'slot_taken', message: 'taken' } },
          { status: 409 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    await user.click(await screen.findByRole('button', { name: '09:00' }))
    await user.type(await screen.findByLabelText('Name'), 'Grace')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText(/just taken/i)).toBeInTheDocument()
  })

  // Window rule: the guest may only book a free slot inside [now, now + 14 days).
  // The server enforces this; the frontend surfaces the message as a toast.
  it('surfaces the server message for an out-of-window slot', async () => {
    server.use(
      http.post(`${API}/event-types/:slug/bookings`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'slot_out_of_window',
              message: 'That time is outside the booking window.',
            },
          },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    await user.click(await screen.findByRole('button', { name: '09:00' }))
    await user.type(await screen.findByLabelText('Name'), 'Grace')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(
      await screen.findByText(/outside the booking window/i),
    ).toBeInTheDocument()
  })

  it('surfaces the server message for a slot in the past', async () => {
    server.use(
      http.post(`${API}/event-types/:slug/bookings`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'slot_in_past',
              message: 'That time is in the past.',
            },
          },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    await user.click(await screen.findByRole('button', { name: '09:00' }))
    await user.type(await screen.findByLabelText('Name'), 'Grace')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText(/in the past/i)).toBeInTheDocument()
  })

  // Server-side validation_failed maps onto per-field form errors (no toast).
  it('shows a field error when the server reports validation_failed', async () => {
    server.use(
      http.post(`${API}/event-types/:slug/bookings`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'validation_failed',
              message: 'Invalid',
              fields: { guest_email: ['That email looks invalid.'] },
            },
          },
          { status: 422 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    await user.click(await screen.findByRole('button', { name: '09:00' }))
    await user.type(await screen.findByLabelText('Name'), 'Grace')
    await user.type(screen.getByLabelText('Email'), 'grace@example.com')
    await user.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(
      await screen.findByText(/that email looks invalid/i),
    ).toBeInTheDocument()
  })

  // Client-side validation blocks submit until name and email are provided.
  it('blocks booking until name and email are filled in', async () => {
    const user = userEvent.setup()
    renderApp(['/e/intro-call'])

    await user.click(await screen.findByRole('button', { name: '09:00' }))
    // Submit with both fields empty — react-hook-form surfaces the zod messages.
    await user.click(await screen.findByRole('button', { name: /confirm booking/i }))

    expect(await screen.findByText('Required')).toBeInTheDocument()
    expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    // Still on the form (no confirmation appeared).
    expect(
      screen.getByRole('button', { name: /confirm booking/i }),
    ).toBeInTheDocument()
  })
})
