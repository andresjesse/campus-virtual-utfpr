import { Flex } from "@mantine/core";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import MenuCategoryTable from "@/components/menu/menu-category-table/MenuCategoryTable.tsx";
import RecordListToolbar from "@/components/table/RecordListToolbar.tsx";
import RouteTabs from "@/components/tabs/RouteTabs.tsx";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import { MENU_TAB_OPTIONS } from "@/helpers/menu-tabs-helper.ts";
import { useRecordList } from "@/hooks/use-record-list.ts";
import {
  deleteMenuCategory,
  listMenuCategories,
} from "@/services/menu-category-service.ts";

export default function MenuCategoryListPage() {
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
    texts: messages.menuCategories.list,
    listRecords: listMenuCategories,
    deleteRecord: deleteMenuCategory,
    getSearchableText: (category) => category.label,
    getName: (category) =>
      category.label || messages.menuCategories.list.noIdentifier,
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
        searchLabel={messages.menuCategories.list.searchLabel}
        searchPlaceholder={messages.menuCategories.list.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        newLabel={messages.menuCategories.list.new}
        onNew={() => navigate("/admin/menu/categories/new")}
      />

      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        pt="md"
        style={{ borderTop: `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.menuCategories.list.title}
      >
        <RouteTabs
          active="categories"
          ariaLabel={messages.menu.tabs.ariaLabel}
          options={MENU_TAB_OPTIONS}
        />

        <Flex flex={1} direction="column" mih={0} bg={branding.colors.surface.panel}>
          {isLoading && (
            <FeedbackState loading title={messages.menuCategories.list.loading} />
          )}
          {!isLoading && error && (
            <FeedbackState
              title={messages.menuCategories.list.loadErrorTitle}
              description={error}
              actionLabel={messages.common.retry}
              onAction={() => void reload()}
            />
          )}
          {!isLoading && !error && records.length === 0 && (
            <FeedbackState
              title={messages.menuCategories.list.emptyTitle}
              description={messages.menuCategories.list.emptyDescription}
            />
          )}
          {!isLoading && !error && records.length > 0 && filtered.length === 0 && (
            <FeedbackState
              title={messages.menuCategories.list.emptyResultsTitle}
              description={messages.menuCategories.list.emptyResultsDescription}
            />
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <MenuCategoryTable
              categories={filtered}
              deletingCategoryId={deletingId}
              onDelete={(category) => void requestDelete(category)}
            />
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
