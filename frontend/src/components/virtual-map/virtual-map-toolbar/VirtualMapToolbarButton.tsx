import { ActionIcon, Tooltip } from "@mantine/core";
import type { Icon } from "@phosphor-icons/react";

import { branding } from "@/config/branding.ts";

type VirtualMapToolbarButtonProps = {
  icon: Icon;
  label: string;
  onClick: () => void;
};

export default function VirtualMapToolbarButton({
  icon: IconComponent,
  label,
  onClick,
}: VirtualMapToolbarButtonProps) {
  return (
    <Tooltip label={label} position="right">
      <ActionIcon variant="subtle" size="lg" radius="md" aria-label={label} onClick={onClick}>
        <IconComponent aria-hidden size={22} color={branding.colors.brand.primary} />
      </ActionIcon>
    </Tooltip>
  );
}
