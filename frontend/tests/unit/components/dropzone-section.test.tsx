import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode, Ref } from 'react'

import { MantineProvider } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { ImageIcon } from '@phosphor-icons/react'
import type { FileRejection } from 'react-dropzone'

import DropzoneSection from '@/components/content-input/DropzoneSection.tsx'
import { FILE_UPLOAD_REJECTION_NOTIFICATION } from '@/helpers/file-helper.ts'

const mockRejections: FileRejection[] = [
  {
    file: new File(['x'], 'big.png', { type: 'image/png' }),
    errors: [{ code: 'file-too-large', message: 'File is too large' }],
  },
]

const mockOpen = jest.fn()
const mockDropzoneProps = jest.fn()

jest.mock('@mantine/dropzone', () => ({
  Dropzone: (props: {
    children?: ReactNode
    onReject?: (rejections: FileRejection[]) => void
    onDrop?: (files: File[]) => void
    openRef?: { current: (() => void) | null }
    ref?: Ref<HTMLButtonElement>
  }) => {
    mockDropzoneProps(props)
    if (props.openRef) props.openRef.current = mockOpen
    return (
      <div>
        <button
          ref={props.ref}
          type="button"
          onClick={() => props.onReject?.(mockRejections)}
        >
          reject
        </button>
        <button
          type="button"
          onClick={() => props.onDrop?.([new File(['x'], 'a.png')])}
        >
          drop
        </button>
        {props.children}
      </div>
    )
  },
}))

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

const notificationsShowMock = jest.mocked(notifications.show)

const baseProps = {
  onDrop: jest.fn(),
  accept: ['image/png'],
  maxSizeInBytes: 1000 * 1000 * 15,
  title: 'Título',
  description: 'Descrição',
  icon: ImageIcon,
}

function renderDropzone(props: Partial<Parameters<typeof DropzoneSection>[0]> = {}) {
  return render(
    <MantineProvider>
      <DropzoneSection {...baseProps} {...props} />
    </MantineProvider>,
  )
}

describe('DropzoneSection', () => {
  beforeEach(() => {
    notificationsShowMock.mockClear()
    mockDropzoneProps.mockClear()
    mockOpen.mockClear()
    baseProps.onDrop.mockClear()
  })

  it('shows a single aggregated notification when files are rejected', () => {
    renderDropzone()

    fireEvent.click(screen.getByText('reject'))

    expect(notificationsShowMock).toHaveBeenCalledTimes(1)
    expect(notificationsShowMock).toHaveBeenCalledWith({
      ...FILE_UPLOAD_REJECTION_NOTIFICATION,
      message: '"big.png" excede o tamanho máximo de 15MB.',
    })
  })

  it('uses the given maxSizeInBytes in the rejection message', () => {
    renderDropzone({ maxSizeInBytes: 1000 * 1000 * 50 })

    fireEvent.click(screen.getByText('reject'))

    expect(notificationsShowMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '"big.png" excede o tamanho máximo de 50MB.',
      }),
    )
  })

  it('does not notify on accepted files and forwards them to onDrop', () => {
    renderDropzone()

    fireEvent.click(screen.getByText('drop'))

    expect(notificationsShowMock).not.toHaveBeenCalled()
    expect(baseProps.onDrop).toHaveBeenCalledWith([expect.any(File)])
  })

  it('forwards accept, maxSize and multiple to the Dropzone', () => {
    renderDropzone({
      accept: { 'model/gltf-binary': ['.glb'] },
      maxSizeInBytes: 123,
      multiple: false,
    })

    expect(mockDropzoneProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        accept: { 'model/gltf-binary': ['.glb'] },
        maxSize: 123,
        multiple: false,
      }),
    )
  })

  it('allows multiple files and click activation by default (inline layout)', () => {
    renderDropzone()

    expect(mockDropzoneProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ multiple: true, activateOnClick: true }),
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Selecionar' })).toBeNull()
  })

  it('renders the action button in the stacked layout and opens the file dialog', () => {
    renderDropzone({ layout: 'stacked', actionLabel: 'Selecionar' })

    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(mockDropzoneProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ activateOnClick: false }),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Selecionar' }))

    expect(mockOpen).toHaveBeenCalledTimes(1)
  })
})
