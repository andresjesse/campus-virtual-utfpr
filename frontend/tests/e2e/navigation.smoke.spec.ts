import { expect, test } from '@playwright/test'

test('redirects unauthenticated users from the administrator page to login', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
  await page.getByRole('link', { name: 'Admin' }).click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { name: 'UTFPR Virtual' }),
  ).toBeVisible()
})
