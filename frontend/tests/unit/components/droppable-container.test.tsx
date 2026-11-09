import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import DroppableContainer from '@/containers/DroppableContainer.tsx'
import { createDataTransfer } from '@/mocks/data-transfer.ts'

function renderDroppable(acceptType?: string) {
  const handleDrop = jest.fn()

  render(
    <MantineProvider>
      <DroppableContainer handleDrop={handleDrop} acceptType={acceptType}>
        <span>Drop zone</span>
      </DroppableContainer>
    </MantineProvider>,
  )

  return { handleDrop, zone: screen.getByText('Drop zone').parentElement! }
}

describe('DroppableContainer', () => {
  it('accepts a plain text drop by default', () => {
    const { handleDrop, zone } = renderDroppable()
    const dataTransfer = createDataTransfer({ 'text/plain': 'rtf_block' })

    const wasNotPrevented = fireEvent.dragOver(zone, { dataTransfer })
    fireEvent.drop(zone, { dataTransfer })

    expect(wasNotPrevented).toBe(false)
    expect(handleDrop).toHaveBeenCalledWith('rtf_block')
  })

  it('ignores a drag that does not carry its data type', () => {
    const { handleDrop, zone } = renderDroppable()
    const dataTransfer = createDataTransfer({ 'application/x-block-id': 'rtf_block:intro' })

    const wasNotPrevented = fireEvent.dragOver(zone, { dataTransfer })
    fireEvent.drop(zone, { dataTransfer })

    expect(wasNotPrevented).toBe(true)
    expect(handleDrop).not.toHaveBeenCalled()
  })

  it('accepts only the configured data type', () => {
    const { handleDrop, zone } = renderDroppable('application/x-block-id')

    fireEvent.drop(zone, { dataTransfer: createDataTransfer({ 'text/plain': 'rtf_block' }) })
    fireEvent.drop(zone, {
      dataTransfer: createDataTransfer({ 'application/x-block-id': 'rtf_block:intro' }),
    })

    expect(handleDrop).toHaveBeenCalledTimes(1)
    expect(handleDrop).toHaveBeenCalledWith('rtf_block:intro')
  })
})
