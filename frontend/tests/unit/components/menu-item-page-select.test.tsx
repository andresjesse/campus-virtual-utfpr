import { MantineProvider } from '@mantine/core'
import { act, fireEvent, render, screen } from '@testing-library/react'

import MenuItemPageSelect from '@/components/menu/menu-item-page-select/MenuItemPageSelect.tsx'
import messages from '@/constants/messages.json'
import { DialogContext } from '@/contexts/dialog-context.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { MenuItemPageOption } from '@/types/menu.ts'

const options: MenuItemPageOption[] = [
  {
    value: 'free',
    label: 'Free Page',
    note: messages.menuItems.editor.pageAvailable,
  },
  {
    value: 'taken',
    label: 'Taken Page',
    ownerLabel: 'Owner Item',
    note: formatMessage(messages.menuItems.editor.pageHeldByItem, 'Owner Item'),
  },
  {
    value: 'bound',
    label: 'Bound Page',
    disabled: true,
    note: messages.menuItems.editor.pageHeldByEntity,
  },
]

function renderSelect({
  value = '',
  confirmed = true,
}: { value?: string; confirmed?: boolean } = {}) {
  const onChange = jest.fn()
  const confirm = jest.fn().mockResolvedValue(confirmed)

  render(
    <MantineProvider>
      <DialogContext value={{ confirm }}>
        <MenuItemPageSelect
          options={options}
          value={value}
          onBlur={jest.fn()}
          onChange={onChange}
        />
      </DialogContext>
    </MantineProvider>,
  )

  return { confirm, onChange }
}

function openDropdown() {
  fireEvent.click(screen.getByPlaceholderText(messages.menuItems.editor.pagePlaceholder))
}

async function pick(label: string) {
  await act(async () => {
    fireEvent.click(screen.getByText(label))
  })
}

describe('MenuItemPageSelect', () => {
  it('shows why each page is or is not available', () => {
    renderSelect()
    openDropdown()

    expect(screen.getByText(messages.menuItems.editor.pageAvailable)).toBeInTheDocument()
    expect(
      screen.getByText(
        formatMessage(messages.menuItems.editor.pageHeldByItem, 'Owner Item'),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(messages.menuItems.editor.pageHeldByEntity),
    ).toBeInTheDocument()
  })

  it('selects a free page without asking anything', async () => {
    const { confirm, onChange } = renderSelect()
    openDropdown()

    await pick('Free Page')

    expect(confirm).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('free')
  })

  it('refuses a page bound to a 3D entity', async () => {
    const { onChange } = renderSelect()
    openDropdown()

    await pick('Bound Page')

    expect(onChange).not.toHaveBeenCalled()
  })

  it('warns that the previous link is only dropped on save', async () => {
    const { confirm } = renderSelect()
    openDropdown()

    await pick('Taken Page')

    expect(confirm).toHaveBeenCalledWith({
      title: messages.menuItems.editor.pageRelinkTitle,
      firstMessage: formatMessage(messages.menuItems.editor.pageRelinkFirst, {
        page: 'Taken Page',
        item: 'Owner Item',
      }),
      secondMessage: formatMessage(messages.menuItems.editor.pageRelinkSecond, {
        item: 'Owner Item',
      }),
      confirmLabel: messages.menuItems.editor.pageRelinkConfirm,
      confirmColor: 'brand',
    })
  })

  it('takes a page held by another item once confirmed', async () => {
    const { onChange } = renderSelect()
    openDropdown()

    await pick('Taken Page')

    expect(onChange).toHaveBeenCalledWith('taken')
  })

  it('keeps the previous selection when the warning is declined', async () => {
    const { onChange } = renderSelect({ value: 'free', confirmed: false })
    openDropdown()

    await pick('Taken Page')

    expect(onChange).not.toHaveBeenCalled()
  })
})
