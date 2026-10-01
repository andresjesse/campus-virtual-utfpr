import { MantineProvider } from '@mantine/core'
import { act, fireEvent, render, screen } from '@testing-library/react'

import MenuItemForm from '@/components/menu/menu-item-form/MenuItemForm.tsx'
import messages from '@/constants/messages.json'
import type { MenuItemFormValues, MenuItemRecord } from '@/types/menu.ts'

jest.mock('@mantine/notifications', () => ({ notifications: { show: jest.fn() } }))

jest.mock('@/services/menu-item-service.ts', () => ({
  getMenuItemIconUrl: () => '',
}))

jest.mock('@/services/menu-category-service.ts', () => ({
  createMenuCategory: jest.fn(),
}))

function createMenuItem(overrides: Partial<MenuItemRecord> = {}): MenuItemRecord {
  return {
    collectionId: 'menu-items-collection',
    collectionName: 'menu_items',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
    id: 'item-id',
    label: 'Item',
    icon: '',
    href: '',
    page: '',
    parent: '',
    category: 'general',
    ...overrides,
  } as MenuItemRecord
}

const menuItems = [
  createMenuItem({ id: 'general-a', label: 'General A', category: 'general' }),
  createMenuItem({ id: 'general-b', label: 'General B', category: 'general' }),
  createMenuItem({ id: 'social-a', label: 'Social A', category: 'social' }),
]

const EMPTY_VALUES: MenuItemFormValues = {
  label: '',
  linkType: 'link',
  href: '',
  page: '',
  isNested: false,
  parent: '',
  category: '',
  icon: null,
}

function renderForm(initialValues: Partial<MenuItemFormValues> = {}) {
  const onSubmit = jest.fn().mockResolvedValue(undefined)

  render(
    <MantineProvider>
      <MenuItemForm
        initialValues={{ ...EMPTY_VALUES, ...initialValues }}
        categoryOptions={[
          { value: 'general', label: 'General' },
          { value: 'social', label: 'Social Media' },
        ]}
        pageOptions={[{ value: 'page-id', label: 'Virtual Tour' }]}
        menuItems={menuItems}
        currentIcon={{ name: 'icon.png' }}
        onCategoryCreated={jest.fn()}
        onSubmit={onSubmit}
      />
    </MantineProvider>,
  )

  return onSubmit
}

function labelField() {
  return screen.getByLabelText(
    (content) =>
      content.trim().replace(/\s*\*$/, '') === messages.menuItems.editor.labelLabel,
  )
}

async function submit() {
  await act(async () => {
    fireEvent.submit(labelField().closest('form')!)
  })
}

function parentField() {
  return screen.getByPlaceholderText(messages.menuItems.editor.parentPlaceholder)
}

async function chooseCategory(label: string) {
  fireEvent.click(screen.getByPlaceholderText(messages.menuItems.editor.categoryPlaceholder))
  await act(async () => {
    fireEvent.click(screen.getByText(label))
  })
}

describe('MenuItemForm', () => {
  it('blocks submission and reports every missing field', async () => {
    const onSubmit = renderForm()

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.menuItems.label.empty)).toBeInTheDocument()
    expect(screen.getByText(messages.menuItems.link.empty)).toBeInTheDocument()
    expect(
      screen.getByText(messages.menuItems.editor.categoryRequiredError),
    ).toBeInTheDocument()
  })

  it('submits a complete link item', async () => {
    const onSubmit = renderForm({
      label: 'Student Area',
      href: 'https://example.com',
      category: 'general',
    })

    await submit()

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Student Area',
        linkType: 'link',
        href: 'https://example.com',
        category: 'general',
      }),
    )
  })

  it('swaps the href input for the page selector', async () => {
    renderForm({ label: 'Student Area', category: 'general' })

    expect(
      screen.getByPlaceholderText(messages.menuItems.editor.hrefPlaceholder),
    ).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText(messages.menuItems.editor.linkOptionPage))
    })

    expect(
      screen.queryByPlaceholderText(messages.menuItems.editor.hrefPlaceholder),
    ).not.toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(messages.menuItems.editor.pagePlaceholder),
    ).toBeInTheDocument()
  })

  it('offers no parent until a category is chosen', async () => {
    renderForm({ label: 'Student Area' })

    await act(async () => {
      fireEvent.click(screen.getByText(messages.menuItems.editor.nestedOptionYes))
    })

    expect(
      screen.getByPlaceholderText(messages.menuItems.editor.parentNeedsCategory),
    ).toBeDisabled()
  })

  it('offers only the items of the chosen category as parents', async () => {
    renderForm({ label: 'Student Area', category: 'general' })

    await act(async () => {
      fireEvent.click(screen.getByText(messages.menuItems.editor.nestedOptionYes))
    })
    fireEvent.click(parentField())

    expect(screen.getByText('General A')).toBeInTheDocument()
    expect(screen.getByText('General B')).toBeInTheDocument()
    expect(screen.queryByText('Social A')).not.toBeInTheDocument()
  })

  it('clears a chosen parent when the category changes', async () => {
    renderForm({
      label: 'Student Area',
      href: 'https://example.com',
      category: 'general',
      isNested: true,
      parent: 'general-a',
    })

    expect(parentField()).toHaveValue('General A')

    await chooseCategory('Social Media')

    expect(parentField()).toHaveValue('')
  })

  it('keeps the stored icon when no new file is chosen', async () => {
    const onSubmit = renderForm({
      label: 'Student Area',
      href: 'https://example.com',
      category: 'general',
    })

    await submit()

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ icon: null }))
  })
})
