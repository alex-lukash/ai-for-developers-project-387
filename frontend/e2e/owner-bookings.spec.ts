import { expect, test } from '@playwright/test'

// Full-stack: a booking created by a guest shows up on the owner's upcoming list.
// The booking is seeded through the same API the SPA uses (via the Vite proxy).
test('a guest booking appears in the owner upcoming list', async ({ page, request }) => {
  const guest = `Owner Sees ${Date.now()}`

  const slotsRes = await request.get('/api/event-types/intro-call/slots')
  expect(slotsRes.ok()).toBeTruthy()
  const slots = await slotsRes.json()
  const day = slots.days.find((d: { slots: unknown[] }) => d.slots.length > 0)
  expect(day, 'expected at least one free slot in the 14-day window').toBeTruthy()
  const startAt = day.slots[0].start_at as string

  const bookRes = await request.post('/api/event-types/intro-call/bookings', {
    data: { start_at: startAt, guest_name: guest, guest_email: 'owner-sees@example.com' },
  })
  expect(bookRes.status()).toBe(201)

  await page.goto('/admin/bookings')
  await expect(page.getByRole('heading', { name: 'Upcoming bookings' })).toBeVisible()
  await expect(page.getByRole('cell', { name: guest })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'owner-sees@example.com' })).toBeVisible()
})
