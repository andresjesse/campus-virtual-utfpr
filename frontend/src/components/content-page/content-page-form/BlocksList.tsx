import type {
  ContentPageBlockMetadata,
  GroupedContentPageBlockMetadata
} from "@/types/content-page.ts";
import BlockDisplay from "@/components/content-input/content-blocks/BlockDisplay.tsx";
// import classes from "@/components/content-page/content-page-form/content-page-form.module.css";
import { type ContentPageBlockType } from "@/enums/content-pages-enum.ts";
import DroppableContainer from "@/containers/DroppableContainer.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import type {ReactNode} from "react";
import {useParams} from "react-router";
import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import FeedbackState from "@/components/feedback-state";
import { Box } from "@mantine/core";
import {DialogContext} from "@/contexts/dialog-context.ts";
import {deleteBlockContent} from "@/services/content-page-service.ts";
import ContentBlockEditOverlay from "@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx";
import {notifications} from "@mantine/notifications";
import {PAGE_BLOCK_COLLECTIONS} from "@/constants/content-constants.ts";
import messages from "@/constants/messages.json";
import {formatMessage} from "@/helpers/message-helper.ts";
import {getRequestErrorMessage} from "@/helpers/request-error-helper.ts";

export default function BlocksList({
  children,
}: {
  children?: ReactNode;
}) {
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
    } catch(requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsLoading(false);
    }
  }, [pageId])

  useEffect(() => {
    void fetchBlocksMetadata();
  }, [fetchBlocksMetadata]);

  function onDropNewBlock(blockType: string) {
    selectedContentBlock.current = {
      title: messages.block.list.newBlockTitle,
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
    const blockName = title || messages.block.list.untitled;
    const hasConfirmed = await dialogBox!.confirm({
      title: messages.block.list.deleteConfirmTitle,
      firstMessage: formatMessage(messages.block.list.deleteConfirmFirst, blockName),
      secondMessage: messages.block.list.deleteConfirmSecond
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
        title: messages.block.list.deletedTitle,
        message: messages.block.list.deletedMessage,
      });
    } catch (deleteError) {
      notifications.show({
        color: "red",
        title: messages.common.deleteErrorTitle,
        message: getRequestErrorMessage(deleteError),
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
        title: messages.block.list.unavailableTitle,
        message: messages.block.list.unavailableMessage,
      });
      return;
    }

    setIsModalOpen(true);
  }

  if (isLoading) {
    return (
      <>
        <FeedbackState title={messages.block.list.loading} loading />
        {children}
      </>
    )
  }

  if (error) {
    return (
      <>
        <FeedbackState
          title={messages.block.list.loadErrorTitle}
          description={error}
          actionLabel={messages.common.retry}
          onAction={fetchBlocksMetadata}
        />
        {children}
      </>
    )
  }

  return (
    <>
      <DroppableContainer handleDrop={onDropNewBlock} >
        <Box px="lg" pt="lg">
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
        {children}
      </DroppableContainer>

      <ContentBlockEditOverlay
        key={`${selectedContentBlock.current?.collectionName}-${selectedContentBlock.current?.id ?? "new"}`}
        blockMetadata={{ ...selectedContentBlock.current!, page: pageId  }}
        onUpdate={updateContentBlocks}
        opened={isModalOpen}
        onClose={closeContentBlockModal}
      />
    </>
  )
}
