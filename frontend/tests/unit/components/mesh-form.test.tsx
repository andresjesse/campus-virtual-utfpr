import { fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import MeshForm from '@/components/mesh/mesh-form/MeshForm.tsx'
import messages from '@/constants/messages.json'
import type { MeshFormValues } from '@/types/mesh.ts'

const mockFile = new File(['x'], 'predio_a.glb', { type: 'model/gltf-binary' })

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
  onSubmit = jest.fn(),
) {
  render(
    <MantineProvider>
      <MeshForm initialValues={initialValues} isEditing={isEditing} onSubmit={onSubmit} />
    </MantineProvider>,
  )
  return onSubmit
}

function submit() {
  fireEvent.submit(screen.getByLabelText(messages.mesh.editor.nameLabel).closest('form')!)
}

describe('MeshForm', () => {
  it('blocks submission and flags the field when the identifier is empty', () => {
    const onSubmit = renderForm()

    submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(messages.mesh.editor.nameLabel)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByText(messages.mesh.identifier.empty)).toBeInTheDocument()
  })

  it('blocks submission and flags the field when the identifier is only whitespace', () => {
    const onSubmit = renderForm()

    fireEvent.change(screen.getByLabelText(messages.mesh.editor.nameLabel), {
      target: { value: '   ' },
    })
    submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.identifier.empty)).toBeInTheDocument()
  })

  it.each([
    ['a space between words', 'predio a'],
    ['a leading space', ' predio_a a'],
    ['an uppercase letter', 'Predio_a'],
    ['an accent', 'prédio_a'],
    ['a hyphen', 'predio-a'],
    ['a dot', 'predio_a.glb'],
  ])('blocks submission when the identifier has %s', (_description, identifier) => {
    const onSubmit = renderForm()

    fireEvent.change(screen.getByLabelText(messages.mesh.editor.nameLabel), {
      target: { value: identifier },
    })
    submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByLabelText(messages.mesh.editor.nameLabel)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByText(messages.mesh.identifier.invalid)).toBeInTheDocument()
  })

  it('explains why an existing mesh with an invalid identifier cannot be saved', () => {
    const onSubmit = renderForm(true, {
      name: 'Predio A',
      description: '',
      file: null,
    })

    submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.identifier.invalid)).toBeInTheDocument()
  })

  it('blocks submission when creating without a file', () => {
    const onSubmit = renderForm()

    fireEvent.change(screen.getByLabelText(messages.mesh.editor.nameLabel), {
      target: { value: 'predio_a' },
    })
    submit()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(messages.mesh.editor.fileRequiredError)).toBeInTheDocument()
  })

  it('does not require a new file when editing', () => {
    const onSubmit = renderForm(true, { name: 'predio_a', description: '', file: null })

    submit()

    expect(screen.queryByText(messages.mesh.editor.fileRequiredError)).toBeNull()
    expect(onSubmit).toHaveBeenCalled()
  })

  it('submits once the identifier is valid and a file was selected', () => {
    const onSubmit = renderForm()

    fireEvent.change(screen.getByLabelText(messages.mesh.editor.nameLabel), {
      target: { value: 'predio_a' },
    })
    fireEvent.click(screen.getByText('Drop'))
    submit()

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'predio_a',
      description: '',
      file: mockFile,
    })
  })

  it('does not require a file when editing an existing mesh', () => {
    const onSubmit = renderForm(true, { name: 'predio_a', description: '', file: null })

    submit()

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'predio_a',
      description: '',
      file: null,
    })
  })
})
