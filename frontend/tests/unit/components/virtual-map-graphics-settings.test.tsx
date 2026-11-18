import { MantineProvider } from '@mantine/core'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ReactNode } from 'react'

import VirtualMapGraphicsSettings from '@/components/virtual-map/virtual-map-graphics/VirtualMapGraphicsSettings.tsx'
import VirtualMapGraphicsSettingsButton from '@/components/virtual-map/virtual-map-graphics/VirtualMapGraphicsSettingsButton.tsx'
import messages from '@/constants/messages.json'
import {
  VIRTUAL_MAP_GRAPHICS_DEFAULTS,
  VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
} from '@/constants/virtual-map-graphics-constants.ts'
import { VIRTUAL_MAP_TOUR_TARGETS } from '@/constants/virtual-map-tour-constants.ts'
import { applyGraphicsSettings } from '@/helpers/virtual-map-graphics-helper.ts'
import { formatMessage } from '@/helpers/message-helper.ts'
import type { VirtualMapGraphicsSettings as GraphicsSettings } from '@/types/virtual-map-graphics.ts'

jest.mock('@/helpers/virtual-map-graphics-helper.ts', () => ({
  ...jest.requireActual('@/helpers/virtual-map-graphics-helper.ts'),
  applyGraphicsSettings: jest.fn(),
}))

const applyMock = jest.mocked(applyGraphicsSettings)
const graphicsMessages = messages.virtualMap.graphics

function renderWithMantine(ui: ReactNode) {
  return render(<MantineProvider>{ui}</MantineProvider>)
}

function renderSettings(overrides: Partial<Parameters<typeof VirtualMapGraphicsSettings>[0]> = {}) {
  const props = {
    draft: VIRTUAL_MAP_GRAPHICS_DEFAULTS,
    currentPixelDensity: 'high' as const,
    isDirty: false,
    onChange: jest.fn(),
    onSave: jest.fn(),
    ...overrides,
  }
  renderWithMantine(<VirtualMapGraphicsSettings {...props} />)

  return props
}

function getSwitch(label: string) {
  return screen.getByRole('switch', { name: (name) => name.startsWith(label) })
}

function getSaveButton() {
  return screen.getByRole('button', { name: graphicsMessages.saveLabel })
}

describe('VirtualMapGraphicsSettings', () => {
  it('shows the draft values', () => {
    const draft: GraphicsSettings = { shadowsEnabled: false, pixelDensity: 'medium', fpsCounterVisible: true }
    renderSettings({ draft })

    expect(getSwitch(graphicsMessages.shadowsLabel)).not.toBeChecked()
    expect(getSwitch(graphicsMessages.fpsCounterLabel)).toBeChecked()
    expect(
      screen.getByRole('radio', { name: graphicsMessages.pixelDensityOptions.medium }),
    ).toBeChecked()
  })

  it('shows the pixel density level currently in use', () => {
    renderSettings({ currentPixelDensity: 'medium' })

    expect(
      screen.getByText(
        formatMessage(graphicsMessages.currentPixelDensity, graphicsMessages.pixelDensityOptions.medium),
      ),
    ).toBeInTheDocument()
  })

  it('reports each change with its setting key', () => {
    const { onChange } = renderSettings()

    fireEvent.click(getSwitch(graphicsMessages.shadowsLabel))
    fireEvent.click(screen.getByRole('radio', { name: graphicsMessages.pixelDensityOptions.low }))
    fireEvent.click(getSwitch(graphicsMessages.fpsCounterLabel))

    expect(onChange).toHaveBeenNthCalledWith(1, 'shadowsEnabled', false)
    expect(onChange).toHaveBeenNthCalledWith(2, 'pixelDensity', 'low')
    expect(onChange).toHaveBeenNthCalledWith(3, 'fpsCounterVisible', true)
  })

  it('only lets the visitor save once something changed', () => {
    renderSettings({ isDirty: false })

    expect(getSaveButton()).toBeDisabled()
  })

  it('saves when the save button is clicked', () => {
    const { onSave } = renderSettings({ isDirty: true })

    fireEvent.click(getSaveButton())

    expect(onSave).toHaveBeenCalledTimes(1)
  })
})

describe('VirtualMapGraphicsSettingsButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  // jsdom has no layout, so Mantine's hideDetached keeps the open dropdown at display: none.
  async function openMenu() {
    fireEvent.click(screen.getByRole('button', { name: graphicsMessages.buttonLabel }))
    const dialog = await screen.findByRole('dialog', { hidden: true })

    return {
      dialog,
      getSwitch: (label: string) =>
        within(dialog).getByRole('switch', { hidden: true, name: (name) => name.startsWith(label) }),
      getRadio: (label: string) => within(dialog).getByRole('radio', { hidden: true, name: label }),
      getSaveButton: () =>
        within(dialog).getByRole('button', { hidden: true, name: graphicsMessages.saveLabel }),
    }
  }

  it('marks the button as the tour target of the graphics step', () => {
    renderWithMantine(<VirtualMapGraphicsSettingsButton />)

    const button = screen.getByRole('button', { name: graphicsMessages.buttonLabel })

    expect(button.closest(`[data-tour="${VIRTUAL_MAP_TOUR_TARGETS.graphicsSettings}"]`)).not.toBeNull()
  })

  it('opens the menu with the stored settings', async () => {
    window.localStorage.setItem(
      VIRTUAL_MAP_GRAPHICS_STORAGE_KEY,
      JSON.stringify({ shadowsEnabled: false, pixelDensity: 'low', fpsCounterVisible: false }),
    )
    renderWithMantine(<VirtualMapGraphicsSettingsButton />)

    const menu = await openMenu()

    expect(within(menu.dialog).getByText(graphicsMessages.title)).toBeInTheDocument()
    expect(menu.getSwitch(graphicsMessages.shadowsLabel)).not.toBeChecked()
    expect(menu.getRadio(graphicsMessages.pixelDensityOptions.low)).toBeChecked()
  })

  it('applies the edited settings on save', async () => {
    renderWithMantine(<VirtualMapGraphicsSettingsButton />)
    const menu = await openMenu()

    fireEvent.click(menu.getSwitch(graphicsMessages.shadowsLabel))
    fireEvent.click(menu.getRadio(graphicsMessages.pixelDensityOptions.medium))
    fireEvent.click(menu.getSaveButton())

    expect(applyMock).toHaveBeenCalledWith({
      ...VIRTUAL_MAP_GRAPHICS_DEFAULTS,
      shadowsEnabled: false,
      pixelDensity: 'medium',
    })
  })

  it('discards the edits when the menu is closed without saving', async () => {
    renderWithMantine(<VirtualMapGraphicsSettingsButton />)
    const firstMenu = await openMenu()

    fireEvent.click(firstMenu.getSwitch(graphicsMessages.fpsCounterLabel))
    expect(firstMenu.getSwitch(graphicsMessages.fpsCounterLabel)).toBeChecked()

    fireEvent.keyDown(firstMenu.dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument())

    const menu = await openMenu()

    expect(menu.getSwitch(graphicsMessages.fpsCounterLabel)).not.toBeChecked()
    expect(menu.getSaveButton()).toBeDisabled()
    expect(applyMock).not.toHaveBeenCalled()
  })
})
