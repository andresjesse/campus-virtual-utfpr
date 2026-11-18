import { Flex } from "@mantine/core";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import PageTable from "@/components/content-page/page-table/PageTable.tsx";
import RecordListToolbar from "@/components/table/RecordListToolbar.tsx";
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
    <Flex
      direction="column"
      px={{ base: "sm", sm: "lg" }}
      pt={{ base: "sm", sm: "lg" }}
      pb={0}
      mih="calc(100dvh - var(--app-shell-header-offset))"
    >
      <RecordListToolbar
        searchLabel={messages.contentPages.list.searchLabel}
        searchPlaceholder={messages.contentPages.list.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        newLabel={messages.contentPages.list.new}
        onNew={() => navigate("/admin/pages/new")}
      />

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
