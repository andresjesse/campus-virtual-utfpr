import type { BlockDropPlacement, ContentPageBlockMetadata } from "@/types/content-page.ts";
import BlockDisplay from "@/components/content-input/content-blocks/BlockDisplay.tsx";
// import classes from "@/components/content-page/content-page-form/content-page-form.module.css";
import { type ContentPageBlockType } from "@/enums/content-pages-enum.ts";
import DroppableContainer from "@/containers/DroppableContainer.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import type {DragEvent, ReactNode} from "react";
import {useParams} from "react-router";
import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import {
  flattenBlocksMetadata,
  getBlockKey,
  getDropIndex,
  getDropSlot,
  moveBlock,
} from "@/helpers/content-block-order-helper.ts";
import SortableBlockItem from "@/components/content-page/content-page-form/SortableBlockItem.tsx";
import BlockMoveButtons from "@/components/content-input/content-blocks/BlockMoveButtons.tsx";
import {branding} from "@/config/branding.ts";
import FeedbackState from "@/components/feedback-state";
import { Box } from "@mantine/core";
import {DialogContext} from "@/contexts/dialog-context.ts";
import {deleteBlockContent, reorderBlocks} from "@/services/content-page-service.ts";
import ContentBlockEditOverlay from "@/components/content-input/content-blocks/overlay/ContentBlockEditOverlay.tsx";
import {notifications} from "@mantine/notifications";
import messages from "@/constants/messages.json";
import {formatMessage} from "@/helpers/message-helper.ts";
import {getRequestErrorMessage} from "@/helpers/request-error-helper.ts";

export default function BlocksList({
  children,
}: {
  children?: ReactNode;
}) {
  const { pageId } = useParams();

  const [blocksMetadata, setBlocksMetadata] = useState<ContentPageBlockMetadata[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReordering, setIsReordering] = useState(false);
  const [dropSlot, setDropSlot] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const selectedContentBlock = useRef<ContentPageBlockMetadata>(undefined)

  const dialogBox = useContext(DialogContext);

  const fetchBlocksMetadata = useCallback(async () => {
    if (!pageId) return;

    setIsLoading(true);

    try {
      setBlocksMetadata(
        flattenBlocksMetadata(await getAllContentBlocksMetadata(pageId, false))
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
      setBlocksMetadata((currentVal) => currentVal.filter((el) =>
        el.id !== id || el.collectionName !== collectionName
      ))
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

  async function handleMove(fromIndex: number, toIndex: number) {
    const moved = moveBlock(blocksMetadata, fromIndex, toIndex);
    if (moved === blocksMetadata) return;

    setBlocksMetadata(moved);
    setIsReordering(true);

    try {
      setBlocksMetadata(await reorderBlocks(moved));
    } catch (reorderError) {
      notifications.show({
        color: branding.colors.feedback.error,
        title: messages.block.list.reorderErrorTitle,
        message: getRequestErrorMessage(reorderError),
      });
      void fetchBlocksMetadata();
    } finally {
      setIsReordering(false);
    }
  }

  function getDropIndicator(index: number): BlockDropPlacement | null {
    if (dropSlot === index) return "before";
    if (dropSlot === index + 1 && index === blocksMetadata.length - 1) return "after";
    return null;
  }

  function clearDropSlotOnLeave(evt: DragEvent<HTMLElement>) {
    if (!evt.currentTarget.contains(evt.relatedTarget as Node | null)) setDropSlot(null);
  }

  function handleBlockDrop(draggedId: string, targetIndex: number, placement: BlockDropPlacement) {
    setDropSlot(null);

    const fromIndex = blocksMetadata.findIndex((block) => getBlockKey(block) === draggedId);
    if (fromIndex === -1) return;

    void handleMove(fromIndex, getDropIndex(fromIndex, targetIndex, placement));
  }

  async function openModal(blockId: string, collectionName: ContentPageBlockType) {
    selectedContentBlock.current = blocksMetadata.find((el) =>
      el.id === blockId && el.collectionName === collectionName
    )

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
        <Box
          px="lg"
          pt="lg"
          onDragLeave={clearDropSlotOnLeave}
          onDragEnd={() => setDropSlot(null)}
        >
          { blocksMetadata.map((metadata, index) => (
            <SortableBlockItem
              key={getBlockKey(metadata)}
              dragId={getBlockKey(metadata)}
              index={index}
              disabled={isReordering}
              indicator={getDropIndicator(index)}
              onDragOverBlock={(placement) => setDropSlot(getDropSlot(index, placement))}
              onDropBlock={handleBlockDrop}
            >
              <BlockDisplay
                metadata={metadata}
                actions={
                  <BlockMoveButtons
                    blockName={metadata.title || messages.block.list.untitled}
                    canMoveUp={index > 0}
                    canMoveDown={index < blocksMetadata.length - 1}
                    disabled={isReordering}
                    onMoveUp={() => void handleMove(index, index - 1)}
                    onMoveDown={() => void handleMove(index, index + 1)}
                  />
                }
                onDelete={() => handleDelete(metadata.id!, metadata.title, metadata.collectionName)}
                onEdit={(
                  blockId: string,
                  collectionName: ContentPageBlockType
                ) => openModal(blockId, collectionName)}
              />
            </SortableBlockItem>
          ))}
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
