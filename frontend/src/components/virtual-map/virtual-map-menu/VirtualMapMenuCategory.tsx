import { Stack, Text } from "@mantine/core";

import VirtualMapMenuItem from "@/components/virtual-map/virtual-map-menu/VirtualMapMenuItem.tsx";
import { branding } from "@/config/branding.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";
import type { MenuTreeCategory } from "@/types/menu.ts";

type VirtualMapMenuCategoryProps = {
  category: MenuTreeCategory;
  onOpenPage: (page: ContentPageRecord) => void;
};

export default function VirtualMapMenuCategory({
  category,
  onOpenPage,
}: VirtualMapMenuCategoryProps) {
  return (
    <Stack component="section" gap="xs">
      <Text component="h2" fz={10} fw={700} tt="uppercase" lts="0.1em" c={branding.colors.text.muted}>
        {category.label}
      </Text>
      <Stack component="ul" gap={0} p={0} m={0}>
        {category.items.map((node) => (
          <VirtualMapMenuItem key={node.item.id} node={node} onOpenPage={onOpenPage} />
        ))}
      </Stack>
    </Stack>
  );
}
