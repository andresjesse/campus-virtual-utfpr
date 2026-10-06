import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import VirtualMapViewer from '@/components/virtual-map/virtual-map-viewer/VirtualMapViewer.tsx'
import messages from '@/constants/messages.json'
import { formatMessage } from '@/helpers/message-helper.ts'
import { useVirtualMap } from '@/hooks/use-virtual-map.ts'

jest.mock('@/hooks/use-virtual-map.ts', () => ({
  useVirtualMap: jest.fn(),
}))

const useVirtualMapMock = jest.mocked(useVirtualMap)

function renderViewer(state: Partial<ReturnType<typeof useVirtualMap>>) {
  const retry = jest.fn()
  useVirtualMapMock.mockReturnValue({
    status: 'loading',
    progress: 0,
    error: '',
    retry,
    ...state,
  })

  render(
    <MantineProvider>
      <VirtualMapViewer />
    </MantineProvider>,
  )

  return { retry }
}

describe('VirtualMapViewer', () => {
  it('passes its canvas to the virtual map hook', () => {
    renderViewer({ status: 'ready' })

    const canvas = screen.getByLabelText(messages.virtualMap.viewer.canvasAriaLabel)
    expect(canvas.tagName).toBe('CANVAS')
    expect(useVirtualMapMock.mock.calls[0][0].current).toBe(canvas)
  })

  it('shows the loading percentage while models load', () => {
    renderViewer({ status: 'loading', progress: 42 })

    expect(screen.getByRole('status')).toHaveTextContent(
      messages.virtualMap.viewer.loadingTitle,
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42')
    expect(
      screen.getByText(formatMessage(messages.virtualMap.viewer.loadingProgress, '42')),
    ).toBeInTheDocument()
  })

  it('hides the overlay once the map is ready', () => {
    renderViewer({ status: 'ready', progress: 100 })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('shows the error with a retry action', () => {
    const { retry } = renderViewer({ status: 'error', error: messages.errors.network })

    expect(screen.getByText(messages.virtualMap.viewer.loadErrorTitle)).toBeInTheDocument()
    expect(screen.getByText(messages.errors.network)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: messages.common.retry }))

    expect(retry).toHaveBeenCalledTimes(1)
  })
})
