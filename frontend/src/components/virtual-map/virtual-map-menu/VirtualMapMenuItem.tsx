import { Box, Group, Image, Stack, Text, UnstyledButton } from "@mantine/core";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";

import { branding } from "@/config/branding.ts";
import { getMenuItemIconUrl } from "@/services/menu-item-service.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";
import type { MenuTreeItem } from "@/types/menu.ts";

import classes from "./VirtualMapMenuItem.module.css";

type VirtualMapMenuItemProps = {
  node: MenuTreeItem;
  onOpenPage: (page: ContentPageRecord) => void;
};

export default function VirtualMapMenuItem({ node, onOpenPage }: VirtualMapMenuItemProps) {
  const { item, children } = node;
  const page = item.expand?.page;
  const iconUrl = getMenuItemIconUrl(item);

  const linkProps = item.href
    ? { component: "a" as const, href: item.href, target: "_blank", rel: "noopener noreferrer" }
    : { component: "button" as const, onClick: page ? () => onOpenPage(page) : undefined, disabled: !page };

  return (
    <Box component="li" style={{ listStyle: "none" }}>
      <UnstyledButton
        {...linkProps}
        className={classes.item}
        w="100%"
        p="sm"
        c={branding.colors.text.primary}
        style={{ display: "block", borderRadius: "var(--mantine-radius-md)" }}
      >
        <Group gap="md" wrap="nowrap">
          <Image src={iconUrl} alt="" w={28} h={28} fit="contain" />
          <Text size="md" fw={500} flex={1}>
            {item.label}
          </Text>
          <CaretRightIcon aria-hidden color={branding.colors.text.primary} />
        </Group>
      </UnstyledButton>
      {children.length > 0 && (
        <Stack component="ul" gap={0} p={0} m={0} pl="lg">
          {children.map((child) => (
            <VirtualMapMenuItem key={child.item.id} node={child} onOpenPage={onOpenPage} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
