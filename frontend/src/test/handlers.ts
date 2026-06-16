import { http, HttpResponse } from 'msw'

/** MSW base — must match VITE_API_BASE_URL in vite.config.ts test env. */
export const API = 'http://localhost/api'

// Wire-format (snake_case) fixtures, as the real API and Prism would return.
export const ownerFixture = {
  name: 'Ada Owner',
  email: 'ada@example.com',
  timezone: 'UTC',
  workday_start: '09:00',
  workday_end: '17:00',
  working_days: [1, 2, 3, 4, 5],
}

export const activeEventType = {
  id: 1,
  slug: 'intro-call',
  title: 'Intro Call',
  description: 'A quick chat',
  duration_minutes: 30,
  is_active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

export const inactiveEventType = {
  id: 2,
  slug: 'deep-dive',
  title: 'Deep Dive',
  description: 'A longer session',
  duration_minutes: 60,
  is_active: false,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
}

export const slotsFixture = {
  event_type: { slug: 'intro-call', duration_minutes: 30 },
  timezone: 'UTC',
  days: [
    {
      date: '2026-06-16',
      slots: [
        { start_at: '2026-06-16T09:00:00Z', end_at: '2026-06-16T09:30:00Z' },
        { start_at: '2026-06-16T09:30:00Z', end_at: '2026-06-16T10:00:00Z' },
      ],
    },
  ],
}

export const bookingFixture = {
  id: 99,
  event_type: {
    id: 1,
    slug: 'intro-call',
    title: 'Intro Call',
    duration_minutes: 30,
  },
  start_at: '2026-06-16T09:00:00Z',
  end_at: '2026-06-16T09:30:00Z',
  guest_name: 'Grace Hopper',
  guest_email: 'grace@example.com',
  created_at: '2026-06-10T00:00:00Z',
}

export const handlers = [
  http.get(`${API}/owner`, () => HttpResponse.json(ownerFixture)),

  http.get(`${API}/event-types`, ({ request }) => {
    const includeInactive =
      new URL(request.url).searchParams.get('include_inactive') === 'true'
    const list = includeInactive
      ? [activeEventType, inactiveEventType]
      : [activeEventType]
    return HttpResponse.json(list)
  }),

  http.get(`${API}/event-types/:slug`, ({ params }) => {
    if (params.slug === 'intro-call') return HttpResponse.json(activeEventType)
    return HttpResponse.json(
      { error: { code: 'event_type_not_found', message: 'Not found' } },
      { status: 404 },
    )
  }),

  http.get(`${API}/event-types/:slug/slots`, () =>
    HttpResponse.json(slotsFixture),
  ),

  http.post(`${API}/event-types/:slug/bookings`, () =>
    HttpResponse.json(bookingFixture, { status: 201 }),
  ),

  http.post(`${API}/event-types`, () =>
    HttpResponse.json(activeEventType, { status: 201 }),
  ),

  http.get(`${API}/bookings`, () => HttpResponse.json([bookingFixture])),
]
