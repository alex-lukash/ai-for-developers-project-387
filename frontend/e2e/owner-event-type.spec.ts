import { expect, test } from '@playwright/test'

// Owner creates an event type through the admin form; a unique slug keeps the test
// independent across reruns within one backend lifetime.
test('owner creates a new event type', async ({ page }) => {
  const slug = `e2e-type-${Date.now()}`
  await page.goto('/admin/event-types/new')

  await page.getByLabel('Title').fill('E2E Sync')
  await page.getByLabel('Slug').fill(slug)
  await page.getByLabel('Description').fill('Created by an e2e test.')
  await page.getByLabel('Duration (minutes)').fill('45')
  await page.getByRole('button', { name: 'Create event type' }).click()

  // On success the form redirects to the admin list, where the new row shows up.
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('cell', { name: 'E2E Sync' })).toBeVisible()
  await expect(page.getByRole('cell', { name: slug })).toBeVisible()
})

// A duplicate slug surfaces the backend's 409 (`slug_taken`) as a field error.
test('owner sees a field error when the slug is already taken', async ({ page }) => {
  await page.goto('/admin/event-types/new')

  await page.getByLabel('Title').fill('Duplicate')
  await page.getByLabel('Slug').fill('intro-call') // seeded on startup, always present
  await page.getByLabel('Description').fill('Should clash.')
  await page.getByLabel('Duration (minutes)').fill('30')
  await page.getByRole('button', { name: 'Create event type' }).click()

  await expect(page.getByText('This slug is already taken.')).toBeVisible()
  await expect(page).toHaveURL(/\/new$/)
})
