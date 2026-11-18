import { Flex } from "@mantine/core";
import { useNavigate } from "react-router";

import EntityTable from "@/components/entity/entity-table/EntityTable";
import FeedbackState from "@/components/feedback-state";
import RecordListToolbar from "@/components/table/RecordListToolbar.tsx";
import messages from "@/constants/messages.json";
import { deleteEntity, listEntities } from "@/services/entity-service";

import { branding } from "@/config/branding.ts";
import { useRecordList } from "@/hooks/use-record-list.ts";

export default function EntityListPage() {
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
    texts: messages.entities.list,
    listRecords: listEntities,
    deleteRecord: deleteEntity,
    getSearchableText: (entity) => entity.slug,
    getName: (entity) => entity.slug || messages.entities.list.noIdentifier,
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
        searchLabel={messages.entities.list.searchLabel}
        searchPlaceholder={messages.entities.list.searchPlaceholder}
        query={query}
        onQueryChange={setQuery}
        newLabel={messages.entities.list.new}
        onNew={() => navigate("/admin/entities/new")}
      />

      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        pt="md"
        style={{ borderTop: `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.entities.list.title}
      >
        {isLoading && <FeedbackState loading title={messages.entities.list.loading} />}
        {!isLoading && error && (
          <FeedbackState
            title={messages.entities.list.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
            onAction={() => void reload()}
          />
        )}
        {!isLoading && !error && records.length === 0 && (
          <FeedbackState
            title={messages.entities.list.emptyTitle}
            description={messages.entities.list.emptyDescription}
          />
        )}
        {!isLoading && !error && records.length > 0 && filtered.length === 0 && (
          <FeedbackState
            title={messages.entities.list.emptyResultsTitle}
            description={messages.entities.list.emptyResultsDescription}
          />
        )}
        {!isLoading && !error && filtered.length > 0 && (
          <EntityTable
            entities={filtered}
            deletingEntityId={deletingId}
            onDelete={(entity) => void requestDelete(entity)}
          />
        )}
      </Flex>
    </Flex>
  );
}
