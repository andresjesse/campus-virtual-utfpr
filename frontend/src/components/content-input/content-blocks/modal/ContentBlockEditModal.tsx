import {Button, Modal, type ModalProps} from "@mantine/core";
import type {ContentPageBlockMetadata, ContentPageBlockValue} from "@/types/content-page.ts";
import useContentBlockData from "@/hooks/content-blocks/useContentBlockData.tsx";
import FeedbackState from "@/components/feedback-state";
import RtfBlockEditor from "@/components/content-input/content-blocks/rtf-block/RtfBlockEditor.tsx";
import {PlusIcon} from "@phosphor-icons/react/Plus";
import {useRef} from "react";
type ContentBlockEditModalProps = {
  blockMetadata: ContentPageBlockMetadata;
  onUpdate: () => void;
} & ModalProps

export default function ContentBlockEditModal({ blockMetadata, onUpdate, ...props }: ContentBlockEditModalProps) {
  const { blockData, isLoading, upsertBlockContent } = useContentBlockData(blockMetadata);
  const uncommittedBlockData = useRef<ContentPageBlockValue>(blockData)

  const handleUpdate = async () => {
    await upsertBlockContent(uncommittedBlockData.current)
    onUpdate()
  }

  if (isLoading) {
    return <FeedbackState title="Carregando conteúdo..." />
  }

  return (
    <Modal opened={props.opened} onClose={props.onClose} size="100%">
      { /* blockData hardcoded as string because that we only support RTF for now  */ }
      <RtfBlockEditor
        content={blockData as string}
        onChange={(value) => uncommittedBlockData.current = value}
      />
      <Button
        variant="outline"
        color="yellow"
        size="sm"
        leftSection={<PlusIcon aria-hidden size={16} />}
        onClick={handleUpdate}
        // className={classes.newButton}
      >
        Nova Página
      </Button>
    </Modal>
  );
}