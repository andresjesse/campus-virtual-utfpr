import { Button, Flex, Group } from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useNavigate } from "react-router";

import PageSearch from "@/components/content-page/page-search";
import FeedbackState from "@/components/feedback-state";
import MenuCategoryTable from "@/components/menu/menu-category-table/MenuCategoryTable.tsx";
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
    <Flex direction="column" px="lg" pt="lg" pb={0} mih="calc(100dvh - 60px)">
      <Group justify="space-between" gap="xl" w="100%" mx={0} mt="auto" mb="lg" px="lg">
        <Flex flex={1}>
          <PageSearch
            ariaLabel={messages.menuCategories.list.searchLabel}
            placeholder={messages.menuCategories.list.searchPlaceholder}
            value={query}
            onChange={setQuery}
          />
        </Flex>
        <Button
          variant="outline"
          color="brand"
          size="sm"
          leftSection={<PlusIcon aria-hidden size={16} />}
          onClick={() => navigate("/admin/menu/categories/new")}
        >
          {messages.menuCategories.list.new}
        </Button>
      </Group>

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
