import { Flex } from "@mantine/core";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import MenuItemTable from "@/components/menu/menu-item-table/MenuItemTable.tsx";
import RecordListToolbar from "@/components/table/RecordListToolbar.tsx";
import RouteTabs from "@/components/tabs/RouteTabs.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { MENU_TAB_OPTIONS } from "@/helpers/menu-tabs-helper.ts";
import { useRecordList } from "@/hooks/use-record-list.ts";
import { deleteMenuItem, listMenuItems } from "@/services/menu-item-service.ts";

export default function MenuItemListPage() {
  const navigate = useNavigate();

  const {
    records,
    filtered,
    query,
    setQuery,
    isLoading,
    error,
    reload,
    deletingId,
    requestDelete,
  } = useRecordList({
    texts: messages.menuItems.list,
    listRecords: listMenuItems,
    deleteRecord: deleteMenuItem,
    getSearchableText: (item) => item.label,
    getName: (item) => item.label || messages.menuItems.list.noIdentifier,
  });

  return (
    <Flex
      direction="column"
      px={{ base: "sm", sm: "lg" }}
      pt={{ base: "sm", sm: "lg" }}
      pb={0}
      mih="calc(100dvh - var(--app-shell-header-offset))"
    >
      <RecordListToolbar
        searchLabel={messages.menuItems.list.searchLabel}
        searchPlaceholder={messages.menuItems.list.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        newLabel={messages.menuItems.list.new}
        onNew={() => navigate("/admin/menu/items/new")}
      />

      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        pt="md"
        style={{ borderTop: `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.menuItems.list.title}
      >
        <RouteTabs
          active="items"
          ariaLabel={messages.menu.tabs.ariaLabel}
          options={MENU_TAB_OPTIONS}
        />

        <Flex flex={1} direction="column" mih={0} bg={branding.colors.surface.panel}>
          {isLoading && <FeedbackState loading title={messages.menuItems.list.loading} />}
          {!isLoading && error && (
            <FeedbackState
              title={messages.menuItems.list.loadErrorTitle}
              description={error}
              actionLabel={messages.common.retry}
              onAction={() => void reload()}
            />
          )}
          {!isLoading && !error && records.length === 0 && (
            <FeedbackState
              title={messages.menuItems.list.emptyTitle}
              description={messages.menuItems.list.emptyDescription}
            />
          )}
          {!isLoading && !error && records.length > 0 && filtered.length === 0 && (
            <FeedbackState
              title={messages.menuItems.list.emptyResultsTitle}
              description={messages.menuItems.list.emptyResultsDescription}
            />
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <MenuItemTable
              items={filtered}
              deletingItemId={deletingId}
              onDelete={(item) => void requestDelete(item)}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
