import { MantineProvider, Textarea, TextInput } from '@mantine/core'
import { render, screen } from '@testing-library/react'

import { branding } from '@/config/branding'
import { theme } from '@/theme'

function renderInputs() {
  render(
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <Textarea label="Descrição" />
      <TextInput label="Nome" />
    </MantineProvider>,
  )
}

describe('input focus border', () => {
  it('focuses every input with the brand color, not Mantine darker filled shade', () => {
    renderInputs()

    expect(screen.getByLabelText('Descrição')).toHaveStyle({
      '--input-bd-focus': branding.colors.brand.primary,
    })
    expect(screen.getByLabelText('Nome')).toHaveStyle({
      '--input-bd-focus': branding.colors.brand.primary,
    })
  })
})
