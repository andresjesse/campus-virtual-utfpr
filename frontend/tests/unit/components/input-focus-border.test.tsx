import { MantineProvider, Textarea, TextInput } from '@mantine/core'
import { render, screen } from '@testing-library/react'

import { branding } from '@/config/branding'
import { theme } from '@/theme'

function renderInputs() {
  render(
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Textarea label="Description" />
      <TextInput label="Name" />
    </MantineProvider>,
  )
}

describe('input focus border', () => {
  it('focuses every input with the brand color, not Mantine darker filled shade', () => {
    renderInputs()

    expect(screen.getByLabelText('Description')).toHaveStyle({
      '--input-bd-focus': branding.colors.brand.primary,
    })
    expect(screen.getByLabelText('Name')).toHaveStyle({
      '--input-bd-focus': branding.colors.brand.primary,
    })
  })
})
