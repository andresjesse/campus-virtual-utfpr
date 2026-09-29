import { MantineProvider, Table } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import MenuCategoryTableRow from '@/components/menu/menu-category-table/MenuCategoryTableRow.tsx'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { MenuCategoryRecord } from '@/types/menu.ts'

const category = {
  id: 'c1',
  label: 'Social Media',
  created: '2026-09-24T04:09:13.379Z',
  updated: '2026-09-25T04:09:13.379Z',
} as MenuCategoryRecord

function renderRow(overrides: Partial<MenuCategoryRecord> = {}, deleting = false) {
  const onDelete = jest.fn()
  const onOpen = jest.fn()

  render(
    <MantineProvider>
      <Table>
        <Table.Tbody>
          <MenuCategoryTableRow
            category={{ ...category, ...overrides }}
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

describe('MenuCategoryTableRow', () => {
  it('labels the row with the category label', () => {
    renderRow()

    expect(
      screen.getByRole('row', {
        name: formatMessage(messages.menuCategories.list.editAriaLabel, 'Social Media'),
      }),
    ).toBeInTheDocument()
  })

  it('falls back to the placeholder name and dash when the label is blank', () => {
    renderRow({ label: '' })

    expect(
      screen.getByRole('row', {
        name: formatMessage(
          messages.menuCategories.list.editAriaLabel,
          messages.menuCategories.list.noIdentifier,
        ),
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(messages.common.emptyValue)).toBeInTheDocument()
  })

  it('opens the category when the row is clicked', () => {
    const { onOpen } = renderRow()

    fireEvent.click(screen.getByRole('row'))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('opens the category from the keyboard', () => {
    const { onOpen } = renderRow()

    fireEvent.keyDown(screen.getByRole('row'), { key: 'Enter' })

    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('deletes without opening the category', () => {
    const { onDelete, onOpen } = renderRow()

    fireEvent.click(
      screen.getByRole('button', {
        name: formatMessage(
          messages.menuCategories.list.deleteAriaLabel,
          'Social Media',
        ),
      }),
    )

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('disables the delete action while the category is being removed', () => {
    renderRow({}, true)

    expect(
      screen.getByRole('button', {
        name: formatMessage(
          messages.menuCategories.list.deleteAriaLabel,
          'Social Media',
        ),
      }),
    ).toBeDisabled()
  })
})
