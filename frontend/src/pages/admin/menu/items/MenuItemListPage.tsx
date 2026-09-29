import { Flex } from "@mantine/core";

import FeedbackState from "@/components/feedback-state";
import RouteTabs from "@/components/tabs/RouteTabs.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { MENU_TAB_OPTIONS } from "@/helpers/menu-tabs-helper.ts";

export default function MenuItemListPage() {
  return (
    <Flex direction="column" px="lg" pt="lg" pb={0} mih="calc(100dvh - 60px)">
      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        aria-label={messages.menu.itemsPlaceholder.title}
      >
        <RouteTabs
          active="items"
          ariaLabel={messages.menu.tabs.ariaLabel}
          options={MENU_TAB_OPTIONS}
        />

        <Flex flex={1} direction="column" mih={0} bg={branding.colors.surface.panel}>
          <FeedbackState
            title={messages.menu.itemsPlaceholder.title}
            description={messages.menu.itemsPlaceholder.description}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
