import { Paper, Text } from "@mantine/core";
import type { ReactNode } from "react";

import classes from "./element-preview-card.module.css";

type ElementPreviewCardProps = {
  children: ReactNode;
  label: string;
  muted?: boolean;
};

export default function ElementPreviewCard({
  children,
  label,
  muted = false,
}: ElementPreviewCardProps) {
  return (
    <section aria-label={`${label} (indisponível)`}>
      <Text fw={700} fz="md" mb={6}>
        {label}
      </Text>
      <Paper className={muted ? classes.muted : classes.card}>{children}</Paper>
    </section>
  );
}
