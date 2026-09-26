import {Button, Flex, Group} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";

import FeedbackState from "@/components/feedback-state";
import PageSearch from "@/components/content-page/page-search";
import MeshTable from "@/components/mesh/mesh-table/MeshTable";
import messages from "@/constants/messages.json";
import { getRequestErrorMessage } from "@/helpers/request-error-helper";
import { deleteMesh, listMeshes } from "@/services/mesh-service";
import type { MeshRecord } from "@/types/mesh";

import {branding} from "@/config/branding.ts";
import {useLocaleSearch} from "@/hooks/use-locale-search.ts";
import {DialogContext} from "@/contexts/dialog-context.ts";
import {formatMessage} from "@/helpers/message-helper.ts";

export default function MeshListPage() {
  const navigate = useNavigate();
  const [meshes, setMeshes] = useState<MeshRecord[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingMeshId, setDeletingMeshId] = useState<string | null>(null);

  const dialogBox = useContext(DialogContext);

  const loadMeshes = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      setMeshes(await listMeshes());
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (mesh: MeshRecord) => {
      const name = mesh.name || messages.mesh.list.noIdentifier;

      const confirmDelete = await dialogBox!.confirm({
        title: messages.mesh.list.deleteConfirmTitle,
        firstMessage: formatMessage(messages.mesh.list.deleteConfirmFirst, name),
        secondMessage: messages.mesh.list.deleteConfirmSecond,
      });

      if (!confirmDelete) return;

      setDeletingMeshId(mesh.id);

      try {
        await deleteMesh(mesh.id);
        setMeshes((currentMeshes) =>
          currentMeshes.filter((currentMesh) => currentMesh.id !== mesh.id),
        );
        notifications.show({
          color: "green",
          title: messages.mesh.list.deletedTitle,
          message: messages.mesh.list.deletedMessage,
        });
      } catch (deleteError) {
        notifications.show({
          color: "red",
          title: messages.mesh.list.deleteErrorTitle,
          message: getRequestErrorMessage(deleteError),
        });
      } finally {
        setDeletingMeshId(null);
      }
    },
    [dialogBox],
  );

  const filteredMeshes = useLocaleSearch(meshes, query, (mesh) => mesh.name);

  useEffect(() => {
    void loadMeshes();
  }, [loadMeshes]);

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
        style={{ "border-top": `1px solid ${branding.colors.border.default}` }}
        aria-label={messages.mesh.list.title}
      >
        {isLoading && <FeedbackState loading title={messages.mesh.list.loading} />}
        {!isLoading && error && (
          <FeedbackState
            title={messages.mesh.list.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
            onAction={() => void loadMeshes()}
          />
        )}
        {!isLoading && !error && meshes.length === 0 && (
          <FeedbackState
            title={messages.mesh.list.emptyTitle}
            description={messages.mesh.list.emptyDescription}
          />
        )}
        {!isLoading && !error && meshes.length > 0 && filteredMeshes.length === 0 && (
          <FeedbackState
            title={messages.mesh.list.emptyResultsTitle}
            description={messages.mesh.list.emptyResultsDescription}
          />
        )}
        {!isLoading && !error && filteredMeshes.length > 0 && (
          <MeshTable
            meshes={filteredMeshes}
            deletingMeshId={deletingMeshId}
            onDelete={(mesh) => void handleDelete(mesh)}
          />
        )}
      </Flex>
    </Flex>
  );
}