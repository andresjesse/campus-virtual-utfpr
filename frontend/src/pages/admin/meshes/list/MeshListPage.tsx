import {Button, Flex, Group} from "@mantine/core";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import PageSearch from "@/components/content-page/page-search";
import MeshTable from "@/components/mesh/mesh-table/MeshTable";
import messages from "@/constants/messages.json";
import { deleteMesh, listMeshes } from "@/services/mesh-service";

import {branding} from "@/config/branding.ts";
import {useRecordList} from "@/hooks/use-record-list.ts";

export default function MeshListPage() {
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
    texts: messages.mesh.list,
    listRecords: listMeshes,
    deleteRecord: deleteMesh,
    getSearchableText: (mesh) => mesh.name,
    getName: (mesh) => mesh.name || messages.mesh.list.noIdentifier,
  });

  return (
    <Flex direction="column" px="lg" pt="lg" pb={0} mih="calc(100dvh - 60px)" >
      <Group justify="space-between" gap="xl" w="100%" mx={0} mt="auto" mb="lg" px="lg">
        <Flex flex={1}>
          <PageSearch
            ariaLabel={messages.mesh.list.searchLabel}
            placeholder={messages.mesh.list.searchPlaceholder}
            value={query}
            onChange={setQuery}
          />
        </Flex>
        <Button
          variant="outline"
          color="brand"
          size="sm"
          leftSection={<PlusIcon aria-hidden size={16} />}
          onClick={() => navigate("/admin/meshes/new")}
        >
          {messages.mesh.list.new}
        </Button>
      </Group>

      <Flex
        flex={1}
        direction="column"
        mih={0}
        w="100%"
        pt="md"
        style={{ borderTop: `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.mesh.list.title}
      >
        {isLoading && <FeedbackState loading title={messages.mesh.list.loading} />}
        {!isLoading && error && (
          <FeedbackState
            title={messages.mesh.list.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
            onAction={() => void reload()}
          />
        )}
        {!isLoading && !error && records.length === 0 && (
          <FeedbackState
            title={messages.mesh.list.emptyTitle}
            description={messages.mesh.list.emptyDescription}
          />
        )}
        {!isLoading && !error && records.length > 0 && filtered.length === 0 && (
          <FeedbackState
            title={messages.mesh.list.emptyResultsTitle}
            description={messages.mesh.list.emptyResultsDescription}
          />
        )}
        {!isLoading && !error && filtered.length > 0 && (
          <MeshTable
            meshes={filtered}
            deletingMeshId={deletingId}
            onDelete={(mesh) => void requestDelete(mesh)}
          />
        )}
      </Flex>
    </Flex>
  );
}
