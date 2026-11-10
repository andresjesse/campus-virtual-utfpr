import { fireEvent, render, screen } from '@testing-library/react'

import DraggableContainer from '@/containers/DraggableContainer.tsx'
import { createDataTransfer } from '@/mocks/data-transfer.ts'

function getDraggable() {
  return screen.getByText('Rich text').parentElement!
}

describe('DraggableContainer', () => {
  it('copies its data as plain text by default', () => {
    render(<DraggableContainer dataTransported="rtf_block"><span>Rich text</span></DraggableContainer>)
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(getDraggable(), { dataTransfer })

    expect(getDraggable()).toHaveAttribute('draggable', 'true')
    expect(dataTransfer.getData('text/plain')).toBe('rtf_block')
    expect(dataTransfer.effectAllowed).toBe('copy')
  })

  it('uses the given data type and effect', () => {
    render(
      <DraggableContainer dataTransported="rtf_block:intro" dataType="application/x-block-id" effect="move">
        <span>Rich text</span>
      </DraggableContainer>,
    )
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(getDraggable(), { dataTransfer })

    expect(dataTransfer.types).toEqual(['application/x-block-id'])
    expect(dataTransfer.effectAllowed).toBe('move')
  })

  it('cannot be dragged while disabled', () => {
    render(
      <DraggableContainer dataTransported="rtf_block" enabled={false}>
        <span>Rich text</span>
      </DraggableContainer>,
    )
    const dataTransfer = createDataTransfer()

    fireEvent.dragStart(getDraggable(), { dataTransfer })

    expect(getDraggable()).toHaveAttribute('draggable', 'false')
    expect(dataTransfer.setData).not.toHaveBeenCalled()
  })
})
