import { MantineProvider, Table } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import MenuItemTableRow from '@/components/menu/menu-item-table/MenuItemTableRow.tsx'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { MenuItemRecord } from '@/types/menu.ts'

jest.mock('@/services/menu-item-service.ts', () => ({
  getMenuItemIconUrl: (record: { icon: string }) =>
    record.icon ? `https://files.example.com/${record.icon}` : '',
}))

function createMenuItem(overrides: Partial<MenuItemRecord> = {}): MenuItemRecord {
  return {
    collectionId: 'menu-items-collection',
    collectionName: 'menu_items',
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-02-01T00:00:00.000Z',
    id: 'item-id',
    label: 'Student Area',
    icon: 'icon.png',
    href: 'https://example.com',
    page: '',
    parent: '',
    category: 'category-id',
    expand: { category: { label: 'General' } },
    ...overrides,
  } as MenuItemRecord
}

function renderRow(
  item: MenuItemRecord,
  { deleting = false } = {},
) {
  const onDelete = jest.fn()
  const onOpen = jest.fn()

  render(
    <MantineProvider>
      <Table>
        <Table.Tbody>
          <MenuItemTableRow
            item={item}
            deleting={deleting}
            onDelete={onDelete}
            onOpen={onOpen}
          />
        </Table.Tbody>
      </Table>
    </MantineProvider>,
  )

  return { onDelete, onOpen }
}

function row(name = 'Student Area') {
  return screen.getByRole('row', {
    name: formatMessage(messages.menuItems.list.editAriaLabel, name),
  })
}

describe('MenuItemTableRow', () => {
  it('shows the label, the category and the link target type', () => {
    renderRow(createMenuItem())

    expect(row()).toHaveTextContent('Student Area')
    expect(row()).toHaveTextContent('General')
    expect(row()).toHaveTextContent(messages.menuItems.list.relatedLink)
  })

  it('shows the page target type when the item links to a page', () => {
    renderRow(createMenuItem({ href: '', page: 'page-id' }))

    expect(row()).toHaveTextContent(messages.menuItems.list.relatedPage)
  })

  it('warns anywhere on the row about an item left without any target', async () => {
    renderRow(createMenuItem({ href: '', page: '' }))

    fireEvent.mouseEnter(row())

    expect(
      await screen.findByText(messages.menuItems.list.noTargetWarning),
    ).toBeInTheDocument()
  })

  it('does not warn about an item that has a target', () => {
    renderRow(createMenuItem())

    fireEvent.mouseEnter(row())

    expect(
      screen.queryByText(messages.menuItems.list.noTargetWarning),
    ).not.toBeInTheDocument()
  })

  it('falls back to a placeholder for an item without a label', () => {
    renderRow(createMenuItem({ label: '' }))

    expect(row(messages.menuItems.list.noIdentifier)).toHaveTextContent(
      messages.common.emptyValue,
    )
  })

  it('renders the icon with a describing alternative text', () => {
    renderRow(createMenuItem())

    expect(
      screen.getByAltText(
        formatMessage(messages.menuItems.list.iconAlt, 'Student Area'),
      ),
    ).toBeInTheDocument()
  })

  it('opens the item on click and on Enter', () => {
    const { onOpen } = renderRow(createMenuItem())

    fireEvent.click(row())
    fireEvent.keyDown(row(), { key: 'Enter' })

    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('deletes without opening the item', () => {
    const { onDelete, onOpen } = renderRow(createMenuItem())

    fireEvent.click(
      screen.getByLabelText(
        formatMessage(messages.menuItems.list.deleteAriaLabel, 'Student Area'),
      ),
    )

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('disables the delete button while the deletion runs', () => {
    renderRow(createMenuItem(), { deleting: true })

    expect(
      screen.getByLabelText(
        formatMessage(messages.menuItems.list.deleteAriaLabel, 'Student Area'),
      ),
    ).toBeDisabled()
  })
})
