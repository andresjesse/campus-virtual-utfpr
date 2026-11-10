import { Group, Text } from "@mantine/core";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { branding } from "@/config/branding.ts";

type FileCardProps = {
  icon: Icon;
  title: ReactNode;
  subtitle: ReactNode;
  action: ReactNode;
};

export default function FileCard({
  icon: FileIcon,
  title,
  subtitle,
  action,
}: FileCardProps) {
  return (
    <Group
      justify="space-between"
      align="center"
      gap="sm"
      p="md"
      bg={branding.colors.surface.interactive}
      bd={`1px solid ${branding.colors.border.default}`}
      bdrs={8}
    >
      <Group gap="sm" align="center" style={{ minWidth: 0 }}>
        <FileIcon aria-hidden size={24} color={branding.colors.text.muted} />
        <div style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {title}
          </Text>
          <Text size="xs" c="dimmed">
            {subtitle}
          </Text>
        </div>
      </Group>
      {action}
    </Group>
  );
}
