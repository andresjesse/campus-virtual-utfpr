import {Box, Divider, Flex} from "@mantine/core";
import type {ReactNode} from "react";

import {branding} from "@/config/branding.ts";

type FormMetadataSectionProps = {
  children: ReactNode;
}

export default function FormMetadataSection({ children }: FormMetadataSectionProps) {
  return (
    <Flex direction="column" flex="0 0 auto">
      <Box
        px={{ base: "2rem", md: "2.5rem" }}
        pt={{ base: "1.15rem", md: "1.5rem" }}
        pb={{ base: "1rem", md: "0.8rem" }}
      >
        {children}
      </Box>
      <Divider size={2} color={branding.colors.border.default} />
    </Flex>
  );
}
