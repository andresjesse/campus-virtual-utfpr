import { ActionIcon, Button, createTheme, Loader } from "@mantine/core";

export const UTFPR_YELLOW = "#fdc003";

export const theme = createTheme({
  components: {
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        loaderProps: { color: UTFPR_YELLOW },
      },
    }),
    Button: Button.extend({
      defaultProps: {
        loaderProps: { color: UTFPR_YELLOW },
      },
    }),
    Loader: Loader.extend({
      defaultProps: {
        color: UTFPR_YELLOW,
      },
    }),
  },
});
