import { expect, test } from '@playwright/test'

import messages from '../../src/constants/messages.json' with { type: 'json' }

test('redirects unauthenticated users from the administrator page to login', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByLabel(messages.virtualMap.viewer.canvasAriaLabel),
  ).toBeAttached()
  await page.getByRole('link', { name: messages.virtualMap.home.adminLink }).click()

  await expect(page).toHaveURL('/login')
  await expect(
    page.getByRole('heading', { name: 'UTFPR Virtual' }),
  ).toBeVisible()
})
