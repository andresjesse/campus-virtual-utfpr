import { act, fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import MeshForm from '@/components/mesh/mesh-form/MeshForm.tsx'
import messages from '@/constants/messages.json'
import type { MeshFormValues } from '@/types/mesh.ts'

jest.mock('@mantine/notifications', () => ({ notifications: { show: jest.fn() } }))

const mockFile = new File(['x'], 'building_a.glb', { type: 'model/gltf-binary' })

jest.mock('@/components/mesh/mesh-glb-dropzone/MeshGlbDropzone.tsx', () => ({
  __esModule: true,
  default: ({ onChange, error }: { onChange: (file: File | null) => void; error?: string }) => (
    <>
      <button type="button" onClick={() => onChange(mockFile)}>
        Drop
      </button>
      {error && <span>{error}</span>}
    </>
  ),
}))

const emptyValues: MeshFormValues = { name: '', description: '', file: null }

function renderForm(
  isEditing = false,
  initialValues: MeshFormValues = emptyValues,
  onSubmit: jest.Mock = jest.fn().mockResolvedValue(undefined),
) {
  render(
    <MantineProvider>
      <MeshForm
        initialValues={initialValues}
        isEditing={isEditing}
        onSubmit={onSubmit}
      />
    </MantineProvider>,
  )
  return onSubmit
}

function typeIdentifier(identifier: string) {
  fireEvent.change(screen.getByLabelText(messages.mesh.editor.nameLabel), {
    target: { value: identifier },
  })
}

async function submit() {
  await act(async () => {
    fireEvent.submit(
      screen.getByLabelText(messages.mesh.editor.nameLabel).closest('form')!,
    )
  })
}

describe('MeshForm', () => {
  it('blocks submission and flags the field when the identifier is empty', async () => {
    const onSubmit = renderForm()

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(messages.mesh.editor.nameLabel)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByText(messages.mesh.identifier.empty)).toBeInTheDocument()
  })

  it('blocks submission and flags the field when the identifier is only whitespace', async () => {
    const onSubmit = renderForm()

    typeIdentifier('   ')
    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.identifier.empty)).toBeInTheDocument()
  })

  it.each([
    ['a space between words', 'building a'],
    ['a leading space', ' building_a a'],
    ['an uppercase letter', 'Building_a'],
    ['an accent', 'café_a'],
    ['a hyphen', 'building-a'],
    ['a dot', 'building_a.glb'],
  ])('blocks submission when the identifier has %s', async (_description, identifier) => {
    const onSubmit = renderForm()

    typeIdentifier(identifier)
    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(messages.mesh.editor.nameLabel)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByText(messages.mesh.identifier.invalid)).toBeInTheDocument()
  })

  it('explains why an existing mesh with an invalid identifier cannot be saved', async () => {
    const onSubmit = renderForm(true, {
      name: 'Building A',
      description: '',
      file: null,
    })

    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.identifier.invalid)).toBeInTheDocument()
  })

  it('blocks submission when creating without a file', async () => {
    const onSubmit = renderForm()

    typeIdentifier('building_a')
    await submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.editor.fileRequiredError)).toBeInTheDocument()
  })

  it('does not require a new file when editing', async () => {
    const onSubmit = renderForm(true, { name: 'building_a', description: '', file: null })

    await submit()

    expect(screen.queryByText(messages.mesh.editor.fileRequiredError)).toBeNull()
    expect(onSubmit).toHaveBeenCalled()
  })

  it('submits once the identifier is valid and a file was selected', async () => {
    const onSubmit = renderForm()

    typeIdentifier('building_a')
    fireEvent.click(screen.getByText('Drop'))
    await submit()

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'building_a',
      description: '',
      file: mockFile,
    })
  })

  it('does not require a file when editing an existing mesh', async () => {
    const onSubmit = renderForm(true, { name: 'building_a', description: '', file: null })

    await submit()

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'building_a',
      description: '',
      file: null,
    })
  })

  describe('an identifier the server rejects as duplicate', () => {
    const takenValues: MeshFormValues = {
      name: 'building_a',
      description: '',
      file: null,
    }

    // What PocketBase answers when the mesh.name unique index rejects the record.
    function rejectingSubmit() {
      return jest.fn().mockRejectedValue({
        status: 400,
        response: {
          status: 400,
          message: 'Failed to create record.',
          data: {
            name: { code: 'validation_not_unique', message: 'Value must be unique.' },
          },
        },
      })
    }

    it('shows the conflict inline and blocks another request for the same name', async () => {
      const onSubmit = renderForm(true, takenValues, rejectingSubmit())

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(screen.getByText(messages.mesh.errors.duplicate)).toBeInTheDocument()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it('clears the conflict once the identifier changes', async () => {
      const onSubmit = renderForm(true, takenValues, rejectingSubmit())

      await submit()
      expect(screen.getByText(messages.mesh.errors.duplicate)).toBeInTheDocument()

      typeIdentifier('building_b')

      expect(screen.queryByText(messages.mesh.errors.duplicate)).toBeNull()

      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })

    it('does not show a field error when the failure is not about a field', async () => {
      const onSubmit = jest
        .fn()
        .mockRejectedValue({ status: 403, response: { status: 403, data: {} } })
      renderForm(true, takenValues, onSubmit)

      await submit()

      expect(screen.queryByText(messages.mesh.errors.duplicate)).toBeNull()
      expect(screen.queryByText(messages.errors.forbidden)).toBeNull()

      // a failure it cannot attribute to the identifier must not block retrying
      await submit()

      expect(onSubmit).toHaveBeenCalledTimes(2)
    })
  })
})
