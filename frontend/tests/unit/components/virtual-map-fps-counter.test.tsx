import { MantineProvider } from '@mantine/core'
import { act, render, screen } from '@testing-library/react'

import VirtualMapFpsCounter from '@/components/virtual-map/virtual-map-graphics/VirtualMapFpsCounter.tsx'
import messages from '@/constants/messages.json'
import { VIRTUAL_MAP_EVENTS } from '@/constants/virtual-map-constants.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import { virtualMapEventBus } from '@/helpers/virtual-map-event-bus.ts'

const counterMessages = messages.virtualMap.fpsCounter

function renderCounter() {
  return render(
    <MantineProvider>
      <VirtualMapFpsCounter />
    </MantineProvider>,
  )
}

function dispatchStats(stats = { fps: 58, drawCalls: 42, triangles: 125000 }) {
  act(() => virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.RENDER_STATS_UPDATED, stats))
}

describe('VirtualMapFpsCounter', () => {
  it('renders nothing before the first stats arrive', () => {
    const { container } = renderCounter()

    expect(container.querySelector('.mantine-Paper-root')).not.toBeInTheDocument()
  })

  it('shows the latest frame rate, draw calls and triangles', () => {
    renderCounter()

    dispatchStats({ fps: 30, drawCalls: 10, triangles: 500 })
    dispatchStats()

    expect(screen.getByText(formatMessage(counterMessages.fps, (58).toLocaleString()))).toBeInTheDocument()
    expect(
      screen.getByText(formatMessage(counterMessages.drawCalls, (42).toLocaleString())),
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatMessage(counterMessages.triangles, (125000).toLocaleString())),
    ).toBeInTheDocument()
  })

  it('stops listening once unmounted', () => {
    const unregister = jest.fn()
    const registerSpy = jest.spyOn(virtualMapEventBus, 'register').mockReturnValue(unregister)
    const { unmount } = renderCounter()

    expect(registerSpy).toHaveBeenCalledWith(
      VIRTUAL_MAP_EVENTS.RENDER_STATS_UPDATED,
      expect.any(Function),
    )

    unmount()

    expect(unregister).toHaveBeenCalledTimes(1)
    registerSpy.mockRestore()
  })
})
