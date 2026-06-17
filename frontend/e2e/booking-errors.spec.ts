import { expect, test } from '@playwright/test'

// Client-side validation: zod rejects an empty form before any request goes out.
test('booking form shows client-side validation errors', async ({ page }) => {
  await page.goto('/e/intro-call')
  await page.getByRole('button', { name: /^\d{1,2}:\d{2}$/ }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Confirm your details' })
  await dialog.getByRole('button', { name: 'Confirm booking' }).click()

  await expect(dialog.getByText('Required')).toBeVisible()
  await expect(dialog.getByText('Enter a valid email')).toBeVisible()
})

// Server conflict: the slot the UI is showing gets booked out-of-band, so confirming
// it must hit the backend's 409 (`slot_taken`) and surface the friendly toast.
test('booking a slot taken moments earlier shows a friendly error', async ({ page, request }) => {
  await page.goto('/e/intro-call')

  // The UI's first slot == the API's first free slot (same backend, same instant).
  const slotsRes = await request.get('/api/event-types/intro-call/slots')
  const slots = await slotsRes.json()
  const day = slots.days.find((d: { slots: unknown[] }) => d.slots.length > 0)
  const startAt = day.slots[0].start_at as string

  const stealRes = await request.post('/api/event-types/intro-call/bookings', {
    data: { start_at: startAt, guest_name: 'Squatter', guest_email: 'squatter@example.com' },
  })
  expect(stealRes.status()).toBe(201)

  // The page still shows the (now stale) slot; booking it must fail with a toast.
  await page.getByRole('button', { name: /^\d{1,2}:\d{2}$/ }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Confirm your details' })
  await dialog.getByLabel('Name').fill('Late Comer')
  await dialog.getByLabel('Email').fill('late@example.com')
  await dialog.getByRole('button', { name: 'Confirm booking' }).click()

  await expect(page.getByText(/just taken/i)).toBeVisible()
})
