import { createBrowserRouter, type RouteObject } from 'react-router'
import { GuestLayout } from '@/components/layout/GuestLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { EventTypeListPage } from '@/routes/guest/EventTypeListPage'
import { EventTypeDetailPage } from '@/routes/guest/EventTypeDetailPage'
import { BookingConfirmationPage } from '@/routes/guest/BookingConfirmationPage'
import { EventTypesPage } from '@/routes/admin/EventTypesPage'
import { EventTypeCreatePage } from '@/routes/admin/EventTypeCreatePage'
import { EventTypeEditPage } from '@/routes/admin/EventTypeEditPage'
import { BookingsPage } from '@/routes/admin/BookingsPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: GuestLayout,
    children: [
      { index: true, Component: EventTypeListPage },
      { path: 'e/:slug', Component: EventTypeDetailPage },
      {
        path: 'e/:slug/confirmed/:bookingId',
        Component: BookingConfirmationPage,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true, Component: EventTypesPage },
      { path: 'event-types/new', Component: EventTypeCreatePage },
      { path: 'event-types/:slug/edit', Component: EventTypeEditPage },
      { path: 'bookings', Component: BookingsPage },
    ],
  },
]

export const router = createBrowserRouter(routes)
