import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import RecordListToolbar from '@/components/table/RecordListToolbar.tsx'

function renderToolbar() {
  const onQueryChange = jest.fn()
  const onNew = jest.fn()
  render(
    <MantineProvider>
      <RecordListToolbar
        searchLabel="Search meshes"
        searchPlaceholder="Type a name"
        query=""
        onQueryChange={onQueryChange}
        newLabel="New mesh"
        onNew={onNew}
      />
    </MantineProvider>,
  )
  return { onQueryChange, onNew }
}

describe('RecordListToolbar', () => {
  it('reports what is typed in the search field', () => {
    const { onQueryChange } = renderToolbar()

    fireEvent.change(screen.getByRole('textbox', { name: 'Search meshes' }), {
      target: { value: 'tree' },
    })

    expect(onQueryChange).toHaveBeenCalledWith('tree')
  })

  it('creates a record from both the compact and the full button', () => {
    const { onNew } = renderToolbar()

    const buttons = screen.getAllByRole('button', { name: 'New mesh' })
    expect(buttons).toHaveLength(2)
    buttons.forEach((button) => fireEvent.click(button))

    expect(onNew).toHaveBeenCalledTimes(2)
  })
})
