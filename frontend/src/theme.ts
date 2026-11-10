import { ActionIcon, Button, createTheme, Input, InputWrapper, Loader } from "@mantine/core";

import { branding } from "@/config/branding";

export const theme = createTheme({
  primaryColor: "brand",
  colors: {
    brand: branding.colors.brand.palette,
  },
  components: {
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        loaderProps: { color: "brand" },
      },
    }),
    Input: Input.extend({
      styles: {
        input: { "--input-bd-focus": branding.colors.brand.primary },
      },
    }),
    InputWrapper: InputWrapper.extend({
      styles: {
        required: { color: branding.colors.feedback.error },
      },
    }),
    Button: Button.extend({
      defaultProps: {
        loaderProps: { color: "brand" },
      },
    }),
    Loader: Loader.extend({
      defaultProps: {
        color: "brand",
      },
    }),
  },
});
