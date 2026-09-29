import {Box} from "@mantine/core";
import type {BoxProps} from "@mantine/core";
import type {ReactNode} from "react";

type FormBodySectionProps = BoxProps & {
  children: ReactNode;
}

export default function FormBodySection({ children, ...boxProps }: FormBodySectionProps) {
  return (
    <Box
      px={{ base: "2rem", md: "2.5rem" }}
      {...boxProps}
    >
      {children}
    </Box>
  );
}
