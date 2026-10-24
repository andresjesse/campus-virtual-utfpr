import { expect, test, type Page } from '@playwright/test'

import messages from '../../src/constants/messages.json' with { type: 'json' }

const category = {
  id: 'category000001',
  collectionId: 'menu_categories_collection',
  collectionName: 'menu_categories',
  label: 'Main Menu',
}

const contentPage = {
  id: 'contentpage0001',
  collectionId: 'content_page_collection',
  collectionName: 'content_page',
  title: 'Study Here',
  entity: '',
}

function menuItem(overrides: Record<string, unknown>) {
  return {
    collectionId: 'menu_items_collection',
    collectionName: 'menu_items',
    icon: 'icon.svg',
    href: '',
    page: '',
    parent: '',
    category: category.id,
    expand: { category },
    ...overrides,
  }
}

const linkItem = menuItem({
  id: 'linkitem000001',
  label: 'Admissions Site',
  href: 'https://example.com/admissions',
})

const pageItem = menuItem({
  id: 'pageitem000001',
  label: 'Study Here',
  page: contentPage.id,
  expand: { category, page: contentPage },
})

const nestedItem = menuItem({
  id: 'nesteditem0001',
  label: 'Scholarships',
  href: 'https://example.com/scholarships',
  parent: pageItem.id,
})

const rtfBlock = {
  id: 'rtfblock000001',
  collectionId: 'rtf_block_collection',
  collectionName: 'rtf_block',
  title: 'Courses',
  page: contentPage.id,
  content: '<p>Pick a course that fits you</p>',
}

const emptyList = { page: 1, perPage: 30, totalItems: 0, totalPages: 0, items: [] }

function listOf(items: unknown[]) {
  return { ...emptyList, totalItems: items.length, totalPages: 1, items }
}

async function openMapWithMenu(page: Page) {
  await page.route('**/api/collections/entities/records**', (route) =>
    route.fulfill({ json: emptyList }),
  )
  await page.route('**/api/collections/menu_items/records**', (route) =>
    route.fulfill({ json: listOf([linkItem, pageItem, nestedItem]) }),
  )
  await page.route('**/api/collections/rtf_block/records**', (route) => {
    const isListing = new URL(route.request().url()).pathname.endsWith('/records')
    return route.fulfill({ json: isListing ? listOf([rtfBlock]) : rtfBlock })
  })
  for (const collection of ['file_block', 'diagram_block']) {
    await page.route(`**/api/collections/${collection}/records**`, (route) =>
      route.fulfill({ json: emptyList }),
    )
  }
  await page.route('**/api/files/**/icon.svg**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1"/></svg>',
    }),
  )

  await page.goto('/')
  await expect(page.getByRole('status')).toBeHidden()

  return page.getByRole('button', { name: messages.virtualMap.menu.toggleLabel })
}

test.describe('virtual map menu', () => {
  test('opens and closes the menu sheet from the pull tab', async ({ page }) => {
    const toggle = await openMapWithMenu(page)

    await expect(page.getByText(category.label)).toBeHidden()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText(category.label)).toBeVisible()
    await expect(page.getByText(nestedItem.label)).toBeVisible()

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByText(category.label)).toBeHidden()
  })

  test('links an item with an address to that address in a new tab', async ({ page }) => {
    const toggle = await openMapWithMenu(page)
    await toggle.click()

    const link = page.getByRole('link', { name: linkItem.label })
    await expect(link).toHaveAttribute('href', linkItem.href)
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('opens the linked content page in a modal', async ({ page }) => {
    const toggle = await openMapWithMenu(page)
    await toggle.click()

    await page.getByRole('button', { name: pageItem.label }).click()

    const modal = page.getByRole('dialog', { name: contentPage.title })
    await expect(modal).toBeVisible()
    await expect(modal).toContainText(rtfBlock.title)
    await expect(modal).toContainText('Pick a course that fits you')

    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
  })
})
