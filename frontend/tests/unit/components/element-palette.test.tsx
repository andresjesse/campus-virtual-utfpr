import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen } from '@testing-library/react'

import ElementPalette from '@/components/element-palette/ElementPalette.tsx'
import { CONTENT_EDITOR_EVENTS } from '@/constants/content-constants.ts'
import messages from '@/constants/messages.json'
import { contentEditorEventBus } from '@/helpers/content-editor-event-bus.ts'
import { formatMessage } from '@/helpers/message-helper.ts'

function renderPalette() {
  const onBlockRequested = jest.fn()
  const unregister = contentEditorEventBus.register(
    CONTENT_EDITOR_EVENTS.BLOCK_ADD_REQUESTED,
    onBlockRequested,
  )
  render(
    <MantineProvider>
      <ElementPalette />
    </MantineProvider>,
  )
  return { onBlockRequested, unregister }
}

describe('ElementPalette', () => {
  it('requests a file block when the images card is clicked', () => {
    const { onBlockRequested, unregister } = renderPalette()

    fireEvent.click(
      screen.getByRole('button', {
        name: formatMessage(messages.palette.addAriaLabel, messages.palette.images),
      }),
    )

    expect(onBlockRequested).toHaveBeenCalledWith('file_block')
    unregister()
  })

  it('requests a rich text block from the keyboard', () => {
    const { onBlockRequested, unregister } = renderPalette()
    const card = screen.getByRole('button', {
      name: formatMessage(messages.palette.addAriaLabel, messages.palette.richText),
    })

    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })

    expect(onBlockRequested).toHaveBeenCalledTimes(2)
    expect(onBlockRequested).toHaveBeenCalledWith('rtf_block')
    unregister()
  })

  it('ignores other keys', () => {
    const { onBlockRequested, unregister } = renderPalette()

    fireEvent.keyDown(
      screen.getByRole('button', {
        name: formatMessage(messages.palette.addAriaLabel, messages.palette.images),
      }),
      { key: 'Tab' },
    )

    expect(onBlockRequested).not.toHaveBeenCalled()
    unregister()
  })
})
