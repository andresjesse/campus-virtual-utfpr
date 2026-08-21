import { ActionIcon, Button, createTheme, Loader } from "@mantine/core";

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
