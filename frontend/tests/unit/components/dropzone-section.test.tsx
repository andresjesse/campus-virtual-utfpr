import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode, Ref } from 'react'

import { MantineProvider } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import type { FileRejection } from 'react-dropzone'

import DropzoneSection from '@/components/content-input/content-blocks/overlay/file-block/DropzoneSection.tsx'
import { FILE_UPLOAD_REJECTION_NOTIFICATION } from '@/helpers/file-upload-helper.ts'

const mockRejections: FileRejection[] = [
  {
    file: new File(['x'], 'big.png', { type: 'image/png' }),
    errors: [{ code: 'file-too-large', message: 'File is too large' }],
  },
]

jest.mock('@mantine/dropzone', () => ({
  Dropzone: ({
    children,
    onReject,
    ref,
  }: {
    children?: ReactNode
    onReject?: (rejections: FileRejection[]) => void
    ref?: Ref<HTMLButtonElement>
  }) => (
    <button ref={ref} type="button" onClick={() => onReject?.(mockRejections)}>
      {children}
    </button>
  ),
}))

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}))

const notificationsShowMock = jest.mocked(notifications.show)

describe('DropzoneSection', () => {
  beforeEach(() => {
    notificationsShowMock.mockClear()
  })

  it('shows a single aggregated notification when files are rejected', () => {
    render(
      <MantineProvider>
        <DropzoneSection onDrop={jest.fn()} />
      </MantineProvider>,
    )

    fireEvent.click(screen.getByRole('button'))

    expect(notificationsShowMock).toHaveBeenCalledTimes(1)
    expect(notificationsShowMock).toHaveBeenCalledWith({
      ...FILE_UPLOAD_REJECTION_NOTIFICATION,
      message: '"big.png" excede o tamanho máximo de 15MB.',
    })
  })

  it('does not notify on accepted files', () => {
    render(
      <MantineProvider>
        <DropzoneSection onDrop={jest.fn()} />
      </MantineProvider>,
    )

    expect(notificationsShowMock).not.toHaveBeenCalled()
  })
})