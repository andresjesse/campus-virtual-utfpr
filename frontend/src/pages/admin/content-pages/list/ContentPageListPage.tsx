import {Button, Flex, Group} from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import PageSearch from "@/components/content-page/page-search";
import PageTable from "@/components/content-page/page-table/PageTable.tsx";
import {
  deleteContentPage,
  listContentPages,
} from "@/services/content-page-service.ts";

import {branding} from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import {useRecordList} from "@/hooks/use-record-list.ts";

export default function ContentPageList() {
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
    texts: messages.contentPages.list,
    listRecords: listContentPages,
    deleteRecord: deleteContentPage,
    getSearchableText: (page) => page.title,
    getName: (page) => page.title || messages.contentPages.list.untitled,
  });

  return (
    <Flex direction="column" px="lg" pt="lg" pb={0} mih="calc(100dvh - 60px)" >
      <Group justify="space-between" gap="xl" w="100%" mx={0} mt="auto" mb="lg" px="lg">
        <Flex flex={1}>
          <PageSearch value={query} onChange={setQuery} />
        </Flex>
        <Button
          variant="outline"
          color="brand"
          size="sm"
          leftSection={<PlusIcon aria-hidden size={16} />}
          onClick={() => navigate("/admin/pages/new")}
        >
          {messages.contentPages.list.new}
        </Button>
      </Group>

      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        pt="md"
        style={{ borderTop: `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.contentPages.list.title}
      >
        {isLoading && <FeedbackState loading title={messages.contentPages.list.loading} />}
        {!isLoading && error && (
          <FeedbackState
            title={messages.contentPages.list.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
            onAction={() => void reload()}
          />
        )}
        {!isLoading && !error && records.length === 0 && (
          <FeedbackState
            title={messages.contentPages.list.emptyTitle}
            description={messages.contentPages.list.emptyDescription}
          />
        )}
        {!isLoading && !error && records.length > 0 && filtered.length === 0 && (
          <FeedbackState
            title={messages.contentPages.list.emptyResultsTitle}
            description={messages.contentPages.list.emptyResultsDescription}
          />
        )}
        {!isLoading && !error && filtered.length > 0 && (
          <PageTable
            pages={filtered}
            deletingPageId={deletingId}
            onDelete={(page) => void requestDelete(page)}
          />
        )}
      </Flex>
    </Flex>
  );
}
