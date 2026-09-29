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

const currentFile = { name: 'predio_a_x7f3k2.glb' }

function renderDropzone(
  value: File | null,
  onChange = jest.fn(),
  current?: typeof currentFile,
) {
  render(
    <MantineProvider>
      <MeshGlbDropzone value={value} onChange={onChange} currentFile={current} />
    </MantineProvider>,
  )
  return onChange
}

describe('MeshGlbDropzone', () => {
  it('renders a single-file stacked dropzone with the mesh texts when empty', () => {
    renderDropzone(null)

    expect(screen.getByText(messages.mesh.editor.dropzoneTitle)).toBeInTheDocument()
    expect(screen.getByText(messages.common.selectFiles)).toBeInTheDocument()
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

  describe('with a stored file', () => {
    it('shows the current file name instead of the dropzone', () => {
      renderDropzone(null, jest.fn(), currentFile)

      expect(screen.getByText(currentFile.name)).toBeInTheDocument()
      expect(screen.getByText(messages.mesh.editor.currentFileLabel)).toBeInTheDocument()
      expect(screen.queryByText(messages.mesh.editor.dropzoneTitle)).toBeNull()
    })

    it('reveals the dropzone on replace and returns to the card on cancel', () => {
      renderDropzone(null, jest.fn(), currentFile)

      fireEvent.click(screen.getByRole('button', { name: messages.mesh.editor.replaceFileLabel }))
      expect(screen.getByText(messages.mesh.editor.dropzoneTitle)).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: messages.mesh.editor.cancelReplaceLabel }))
      expect(screen.getByText(currentFile.name)).toBeInTheDocument()
    })
  })
})
