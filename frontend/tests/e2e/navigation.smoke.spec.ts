import { expect, test } from '@playwright/test'

test('navigates from the home page to the administrator page', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  await page.getByRole('link', { name: 'Admin' }).click()

  await expect(page).toHaveURL('/admin')
  await expect(page.getByText('Admin Home')).toBeVisible()
})
