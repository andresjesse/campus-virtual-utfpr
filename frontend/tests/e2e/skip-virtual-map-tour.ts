import type { Page } from '@playwright/test'

import { getStorageKey } from '../../src/config/branding.ts'

export async function skipVirtualMapTour(page: Page) {
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, 'true'),
    getStorageKey('virtual-map-tour-completed'),
  )
}
