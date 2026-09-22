import { fireEvent, render, screen } from '@testing-library/react'

import { MantineProvider } from '@mantine/core'

import MeshGlbDropzone from '@/components/mesh/mesh-glb-dropzone/MeshGlbDropzone.tsx'
import messages from '@/constants/messages.json'

const mockFile = new File(['x'.repeat(2_500_000)], 'predio_a.glb', {
  type: 'model/gltf-binary',
})

jest.mock('@/components/content-input/DropzoneSection.tsx', () => ({
  __esModule: true,
  default: ({
    onDrop,
    title,
    actionLabel,
    multiple,
    layout,
  }: {
    onDrop: (files: File[]) => void
    title: string
    actionLabel?: string
    multiple?: boolean
    layout?: string
  }) => (
    <div data-multiple={String(multiple)} data-layout={layout}>
      <span>{title}</span>
      <span>{actionLabel}</span>
      <button type="button" onClick={() => onDrop([mockFile])}>
        Drop
      </button>
      <button type="button" onClick={() => onDrop([])}>
        DropNothing
      </button>
    </div>
  ),
}))

function renderDropzone(value: File | null, onChange = jest.fn()) {
  render(
    <MantineProvider>
      <MeshGlbDropzone value={value} onChange={onChange} />
    </MantineProvider>,
  )
  return onChange
}

describe('MeshGlbDropzone', () => {
  it('renders a single-file stacked dropzone with the mesh texts when empty', () => {
    renderDropzone(null)

    expect(screen.getByText(messages.mesh.editor.dropzoneTitle)).toBeInTheDocument()
    expect(screen.getByText(messages.mesh.editor.dropzoneAction)).toBeInTheDocument()
    expect(screen.getByText('Drop').parentElement).toHaveAttribute('data-multiple', 'false')
    expect(screen.getByText('Drop').parentElement).toHaveAttribute('data-layout', 'stacked')
  })

  it('reports the dropped file through onChange', () => {
    const onChange = renderDropzone(null)

    fireEvent.click(screen.getByText('Drop'))

    expect(onChange).toHaveBeenCalledWith(mockFile)
  })

  it('reports null when nothing was dropped', () => {
    const onChange = renderDropzone(null)

    fireEvent.click(screen.getByText('DropNothing'))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('shows the selected file card and removes it through onChange(null)', () => {
    const onChange = renderDropzone(mockFile)

    expect(screen.getByText('predio_a.glb')).toBeInTheDocument()
    expect(screen.getByText('2.5MB')).toBeInTheDocument()
    expect(screen.queryByText(messages.mesh.editor.dropzoneTitle)).toBeNull()

    fireEvent.click(
      screen.getByRole('button', { name: messages.mesh.editor.removeFileLabel }),
    )

    expect(onChange).toHaveBeenCalledWith(null)
  })
})
