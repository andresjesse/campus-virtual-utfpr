import { type ReactNode } from 'react';
import {Paper} from "@mantine/core";

type IllustrativeBlockProps = {
  children?: ReactNode;
}

export default function IllustrativeBlock({ children }: IllustrativeBlockProps) {
  return (
    <Paper
      display="grid"
      mih="5rem"
      bd="2px solid var(--app-border-strong)"
      bdrs="0.4rem"
      c="var(--app-text-primary)"
      bg="var(--app-surface-interactive)"
      style={{ placeItems: "center" }}
    >
      {children}
    </Paper>
  );
}