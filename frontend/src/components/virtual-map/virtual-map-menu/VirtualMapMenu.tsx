import { Box, Collapse, Group, Paper, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { MapTrifoldIcon } from "@phosphor-icons/react/dist/csr/MapTrifold";
import { useId, useState } from "react";

import FeedbackState from "@/components/feedback-state/index.tsx";
import VirtualMapMenuHeader from "@/components/virtual-map/virtual-map-menu/VirtualMapMenuHeader.tsx";
import VirtualMapMenuCategory from "@/components/virtual-map/virtual-map-menu/VirtualMapMenuCategory.tsx";
import VirtualMapEntityModal from "@/components/virtual-map/virtual-map-viewer/VirtualMapEntityModal.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { useVirtualMapMenu } from "@/hooks/use-virtual-map-menu.ts";
import { useVirtualMapPageBlocks } from "@/hooks/use-virtual-map-page-blocks.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";

export default function VirtualMapMenu() {
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState<ContentPageRecord | null>(null);
  const [isPageOpen, setIsPageOpen] = useState(false);
  const { status, categories, error, retry } = useVirtualMapMenu();
  const pageBlocks = useVirtualMapPageBlocks(page);

  function openPage(selectedPage: ContentPageRecord) {
    setPage(selectedPage);
    setIsPageOpen(true);
  }

  return (
    <Box
      pos="absolute"
      top={0}
      left={0}
      right={0}
      style={{ zIndex: 2, pointerEvents: "none" }}
    >
      <Box maw={1000} mx="auto" style={{ pointerEvents: "auto" }}>
        <Collapse expanded={isOpen} id={panelId}>
          <Paper
            bg={`color-mix(in srgb, ${branding.colors.surface.panel} 85%, transparent)`}
            c={branding.colors.text.primary}
            py="xl"
            px={{ base: "xl", md: "7.5rem" }}
            h="calc(100dvh - 72px)"
            style={{
              overflowY: "auto",
              borderBottom: `1px solid ${branding.colors.brand.primary}`,
              borderRadius: "0 0 var(--mantine-radius-xl) var(--mantine-radius-xl)",
            }}
          >
            <VirtualMapMenuHeader />
            {status === "loading" && (
              <FeedbackState loading title={messages.block.list.loading} />
            )}
            {status === "error" && (
              <FeedbackState
                title={messages.virtualMap.menu.loadErrorTitle}
                description={error ?? undefined}
                actionLabel={messages.common.retry}
                onAction={retry}
              />
            )}
            {status === "ready" && categories.length === 0 && (
              <FeedbackState title={messages.virtualMap.menu.emptyTitle} />
            )}
            {status === "ready" && categories.length > 0 && (
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl" verticalSpacing="xl">
                {categories.map((category) => (
                  <VirtualMapMenuCategory
                    key={category.id}
                    category={category}
                    onOpenPage={openPage}
                  />
                ))}
              </SimpleGrid>
            )}
          </Paper>
        </Collapse>
      </Box>
      <Box ta="center">
        <UnstyledButton
          pos="relative"
          mt={-1}
          w={140}
          h={56}
          bg={branding.colors.surface.interactive}
          style={{
            pointerEvents: "auto",
            border: `1px solid ${branding.colors.brand.primary}`,
            borderTop: "none",
            borderRadius: "0 0 var(--mantine-radius-xl) var(--mantine-radius-xl)",
            boxShadow: `inset 0 6px 6px -4px color-mix(in srgb, ${branding.colors.surface.shadow} 50%, transparent)`,
          }}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
        >
          <Stack gap={2} align="center">
            <Group gap="sm" wrap="nowrap">
              <MapTrifoldIcon aria-hidden weight="fill" size={22} color={branding.colors.brand.primary} />
              <Text size="xs" fw={700} tt="uppercase" lts="0.2em" c={branding.colors.text.muted}>
                {messages.virtualMap.menu.toggleLabel}
              </Text>
            </Group>
            {isOpen ? (
              <CaretUpIcon aria-hidden weight="bold" color={branding.colors.text.primary} />
            ) : (
              <CaretDownIcon aria-hidden weight="bold" color={branding.colors.text.primary} />
            )}
          </Stack>
        </UnstyledButton>
      </Box>
      {page && (
        <VirtualMapEntityModal
          opened={isPageOpen}
          fallbackTitle={page.title}
          entityPage={pageBlocks}
          onClose={() => setIsPageOpen(false)}
        />
      )}
    </Box>
  );
}
