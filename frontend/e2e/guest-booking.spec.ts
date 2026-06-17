import { expect, test } from '@playwright/test'

// Guest happy path: browse an event type, pick a free slot, book it, land on the
// confirmation page — exercised against the real Spring backend + H2.
test('guest books a free slot end to end', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pick a meeting type' })).toBeVisible()

  await page.getByRole('link', { name: /Intro Call/ }).click()
  await expect(page.getByRole('heading', { name: 'Choose a time' })).toBeVisible()

  // First available slot in the 14-day window (picked dynamically so the test is
  // independent of the current date and of slots consumed by earlier tests).
  await page.getByRole('button', { name: /^\d{1,2}:\d{2}$/ }).first().click()

  const dialog = page.getByRole('dialog', { name: 'Confirm your details' })
  await dialog.getByLabel('Name').fill('Grace Hopper')
  await dialog.getByLabel('Email').fill('grace@example.com')
  await dialog.getByRole('button', { name: 'Confirm booking' }).click()

  await expect(page).toHaveURL(/\/confirmed\//)
  await expect(page.getByText("You're booked!")).toBeVisible()
  await expect(page.getByText('grace@example.com')).toBeVisible()
})
