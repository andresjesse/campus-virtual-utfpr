import {branding} from "@/config/branding.ts";
import {Box} from "@mantine/core";
import type {BoxProps} from "@mantine/core";
import type {ReactNode} from "react";

type RoundedPaperContainerProps = BoxProps & {
  children: ReactNode;
  ariaLabel?: string;
}

export default function RoundedPaperContainer({ children, ariaLabel, ...boxProps }: RoundedPaperContainerProps) {
  return (
    <Box
      component="section"
      aria-label={ariaLabel}
      bg={branding.colors.surface.panel}
      flex="1"
      px="0"
      bdrs="48px 48px 0 0"
      {...boxProps}
    >
      { children }
    </Box>
  );
}
