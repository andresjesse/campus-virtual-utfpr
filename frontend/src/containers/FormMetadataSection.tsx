import {Box, Divider} from "@mantine/core";
import type {ReactNode} from "react";

import {branding} from "@/config/branding.ts";

type FormMetadataSectionProps = {
  children: ReactNode;
  className?: string;
}

export default function FormMetadataSection({ children, className }: FormMetadataSectionProps) {
  return (
    <Box flex="0 0 auto">
      <Box
        className={className}
        px={{ base: "1rem", md: "1.5rem" }}
        pt={{ base: "1rem", md: "0.9rem" }}
        pb={{ base: "1rem", md: "0.8rem" }}
      >
        {children}
      </Box>
      <Divider size={2} color={branding.colors.border.default} />
    </Box>
  );
}
