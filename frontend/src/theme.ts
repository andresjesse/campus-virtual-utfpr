import { ActionIcon, Button, createTheme, Input, Loader } from "@mantine/core";

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
