import { MantineProvider } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { ENTITY_DEFAULT_TRANSFORM } from '@/constants/entity-constants.ts'
import messages from '@/constants/messages.json'
import EntityEditorPage from '@/pages/admin/entities/editor/EntityEditorPage.tsx'
import { createEntity, getEntity, updateEntity } from '@/services/entity-service.ts'
import { listMeshes } from '@/services/mesh-service.ts'
import type { EntityRecord } from '@/types/entity.ts'

jest.mock('@mantine/notifications', () => ({ notifications: { show: jest.fn() } }))
jest.mock('@/services/entity-service.ts', () => ({
  createEntity: jest.fn(),
  getEntity: jest.fn(),
  updateEntity: jest.fn(),
}))
jest.mock('@/services/mesh-service.ts', () => ({ listMeshes: jest.fn() }))

const entityRecord = {
  ...ENTITY_DEFAULT_TRANSFORM,
  id: 'entity-1',
  slug: 'main-entrance',
  mesh: 'mesh-a',
  is_active: true,
} as unknown as EntityRecord

function renderEditor(path: string) {
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/entities/new" element={<EntityEditorPage />} />
          <Route path="/admin/entities/:entityId" element={<EntityEditorPage />} />
          <Route path="/admin/entities" element={<p>entity list</p>} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  )
}

function slugField() {
  return screen.getByLabelText((content) => content.trim().replace(/\s*\*$/, '') === messages.entities.editor.slugLabel)
}

async function submit() {
  await act(async () => {
    fireEvent.submit(slugField().closest('form')!)
  })
}

describe('EntityEditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(listMeshes).mockResolvedValue([{ id: 'mesh-a', name: 'building_a' }] as never)
    jest.mocked(getEntity).mockResolvedValue(entityRecord)
  })

  it('stays on the edit view with the saved values after updating an entity', async () => {
    jest.mocked(updateEntity).mockResolvedValue(entityRecord)
    renderEditor('/admin/entities/entity-1')

    await screen.findByDisplayValue('main-entrance')
    fireEvent.change(slugField(), { target: { value: 'side-entrance' } })
    await submit()

    expect(updateEntity).toHaveBeenCalledWith(
      'entity-1',
      expect.objectContaining({ slug: 'side-entrance' }),
    )
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: messages.entities.editor.saveSuccessTitle }),
    )
    expect(screen.queryByText('entity list')).not.toBeInTheDocument()
    expect(slugField()).toHaveValue('side-entrance')
  })

  it('returns to the list after creating an entity', async () => {
    jest.mocked(createEntity).mockResolvedValue({ ...entityRecord, id: 'entity-2' })
    renderEditor('/admin/entities/new')

    await screen.findByLabelText(messages.entities.editor.newTitle)
    fireEvent.change(slugField(), { target: { value: 'main-entrance' } })
    fireEvent.click(screen.getByPlaceholderText(messages.entities.editor.meshPlaceholder))
    fireEvent.click(await screen.findByText('building_a'))
    await submit()

    expect(createEntity).toHaveBeenCalledTimes(1)
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({ title: messages.entities.editor.saveSuccessTitle }),
    )
    expect(await screen.findByText('entity list')).toBeInTheDocument()
  })

  it('shows no success notification and keeps the typed values when the update fails', async () => {
    jest.mocked(updateEntity).mockRejectedValue(new Error('boom'))
    renderEditor('/admin/entities/entity-1')

    await screen.findByDisplayValue('main-entrance')
    fireEvent.change(slugField(), { target: { value: 'side-entrance' } })
    await submit()

    expect(notifications.show).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: messages.entities.editor.saveSuccessTitle }),
    )
    expect(screen.queryByText('entity list')).not.toBeInTheDocument()
    expect(slugField()).toHaveValue('side-entrance')
  })
})
