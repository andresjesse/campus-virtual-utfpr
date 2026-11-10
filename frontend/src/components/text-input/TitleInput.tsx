import { TextInput, type TextInputProps } from "@mantine/core";

import classes from "./title-input.module.css";

type TitleInputProps = TextInputProps;

export default function TitleInput(props: TitleInputProps) {
  return (
    <TextInput
      {...props}
      classNames={{ input: classes.titleInput }}
      labelProps={{
        mb: "0.3rem",
        c: "var(--app-text-primary)",
        fz: "0.85rem",
        fw: 700,
      }}
    />
  );
}