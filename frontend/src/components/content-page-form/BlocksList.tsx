import type {
  ContentPageBlockMetadata,
  GroupedContentPageBlockMetadata
} from "@/types/content-page.ts";
import BlockDisplay from "@/components/content-input/content-blocks/BlockDisplay.tsx";
import classes from "@/components/content-page-form/content-page-form.module.css";
import { type ContentPageBlockType } from "@/enums/content-pages-enum.ts";
import DroppableContainer from "@/containers/DroppableContainer.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {useParams} from "react-router";
import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import FeedbackState from "@/components/feedback-state";
import { Box } from "@mantine/core";
import {DialogContext} from "@/contexts/dialog-context.ts";
import {deleteBlockContent} from "@/services/content-page-service.ts";
import ContentBlockEditOverlay from "@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx";
import {notifications} from "@mantine/notifications";
import {PAGE_BLOCK_COLLECTIONS} from "@/constants/content-constants.ts";

export default function BlocksList() {
  const { pageId } = useParams();

  const [blocksMetadata, setBlocksMetadata] = useState<GroupedContentPageBlockMetadata>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const selectedContentBlock = useRef<ContentPageBlockMetadata>(undefined)

  const dialogBox = useContext(DialogContext);

  const fetchBlocksMetadata = useCallback(async () => {
    if (!pageId) return;

    setIsLoading(true);

    try {
      setBlocksMetadata(
        await getAllContentBlocksMetadata(pageId, false)
      );
    } catch(error) {
      console.log(error);
      setError("Houve um erro inesperado.")
    } finally {
      setIsLoading(false);
    }
  }, [pageId])

  useEffect(() => {
    void fetchBlocksMetadata();
  }, [fetchBlocksMetadata]);

  function onDropNewBlock(blockType: string) {
    selectedContentBlock.current = {
      title: "Título provisório",
      collectionName: blockType as ContentPageBlockType,
    }
    setIsModalOpen(true);
  }

  function updateContentBlocks() {
    setIsModalOpen(false);
    selectedContentBlock.current = undefined
    void fetchBlocksMetadata();
  }

  function closeContentBlockModal() {
    setIsModalOpen(false);
    selectedContentBlock.current = undefined;
  }

  async function handleDelete(id: string, title: string, collectionName: string) {
    const hasConfirmed = await dialogBox!.confirm({
      title: "Excluir Bloco",
      firstMessage: `Deseja mesmo excluir o bloco ${title ?? "Sem título"}?`,
      secondMessage: "Esta ação não pode ser desfeita."
    })

    if (!hasConfirmed) return;

    try {
      await deleteBlockContent(id, collectionName as ContentPageBlockType)
      setBlocksMetadata((currentVal) => {
        return {
        ...currentVal,
          [collectionName as ContentPageBlockType]: currentVal?.[collectionName as ContentPageBlockType]
            ?.filter((el) => el.id !== id)
        }
      })
      notifications.show({
        color: "green",
        title: "Bloco excluído.",
        message: "O bloco foi excluído corretamente.",
      });
    } catch {
      notifications.show({
        color: "red",
        title: "Não foi possível excluir o bloco.",
        message: "Tente novamente.",
      });
    }
  }

  async function openModal(blockId: string, collectionName: ContentPageBlockType) {
    selectedContentBlock.current
      = blocksMetadata?.[collectionName as ContentPageBlockType]
      ?.find((el) => el.id === blockId)

    if (!selectedContentBlock.current) {
      notifications.show({
        color: "red",
        title: "Recurso indisponível.",
        message: "A ação não pôde ser completada.",
      });
      return;
    }

    setIsModalOpen(true);
  }

  if (isLoading) {
    return <FeedbackState title={"Carregando os blocos de conteúdo..."} loading />
  }

  if (error) {
    return <FeedbackState
      title={"Não foi possível carregar os blocos de conteúdo."}
      description={error}
      actionLabel={"Tentar novamente"}
      onAction={fetchBlocksMetadata}
    />
  }

  return (
    <Box
       flex="1 1 0"
       mih={0}
       h="100%"
       style={{ overflowY: "auto" }}
    >
      <DroppableContainer handleDrop={onDropNewBlock} >
        <Box className={classes.blocksList} pt="lg" ml="lg" mr="lg">
          { PAGE_BLOCK_COLLECTIONS.flatMap((collectionName) => (
              blocksMetadata?.[collectionName] ?? []).map((metadata) => (
              <BlockDisplay
                key={metadata.id}
                metadata={metadata}
                onDelete={() => handleDelete(metadata.id!, metadata.title, metadata.collectionName)}
                onEdit={(
                  blockId: string,
                  collectionName: ContentPageBlockType
                ) => openModal(blockId, collectionName)}
              />
            ))
          )}
        </Box>
      </DroppableContainer>

      <ContentBlockEditOverlay
        key={`${selectedContentBlock.current?.collectionName}-${selectedContentBlock.current?.id ?? "new"}`}
        blockMetadata={{ ...selectedContentBlock.current!, page: pageId  }}
        onUpdate={updateContentBlocks}
        opened={isModalOpen}
        onClose={closeContentBlockModal}
      />
    </Box>
  )
}
