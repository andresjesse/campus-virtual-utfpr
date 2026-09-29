import { MantineProvider, Table } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import MeshTableRow from '@/components/mesh/mesh-table/MeshTableRow.tsx'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { MeshRecord } from '@/types/mesh.ts'

const mesh = {
  id: 'm1',
  name: 'building_a',
  description: 'Block A',
  file: 'building_a_x7.glb',
  created: '2026-09-24T04:09:13.379Z',
  updated: '2026-09-24T04:09:13.379Z',
} as MeshRecord

function renderRow(overrides: Partial<MeshRecord> = {}, deleting = false) {
  const onDelete = jest.fn()
  const onOpen = jest.fn()

  render(
    <MantineProvider>
      <Table>
        <Table.Tbody>
          <MeshTableRow
            mesh={{ ...mesh, ...overrides }}
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

describe('MeshTableRow', () => {
  it('labels the row and the delete action with the mesh identifier', () => {
    renderRow()

    expect(
      screen.getByRole('row', {
        name: formatMessage(messages.mesh.list.editAriaLabel, 'building_a'),
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: formatMessage(messages.mesh.list.deleteAriaLabel, 'building_a'),
      }),
    ).toBeInTheDocument()
  })

  it('falls back to the placeholder texts when the mesh has no identifier', () => {
    renderRow({ name: '', description: '' })

    expect(
      screen.getByRole('button', {
        name: formatMessage(
          messages.mesh.list.deleteAriaLabel,
          messages.mesh.list.noIdentifier,
        ),
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(messages.common.emptyValue)).toHaveLength(2)
  })

  it('opens the editor from the row', () => {
    const { onOpen } = renderRow()

    fireEvent.click(screen.getByRole('row'))

    expect(onOpen).toHaveBeenCalled()
  })

  it('deletes without opening the editor', () => {
    const { onDelete, onOpen } = renderRow()

    fireEvent.click(
      screen.getByRole('button', {
        name: formatMessage(messages.mesh.list.deleteAriaLabel, 'building_a'),
      }),
    )

    expect(onDelete).toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('disables the delete action while the mesh is being deleted', () => {
    renderRow({}, true)

    expect(screen.getByRole('button')).toBeDisabled()
  })
})
