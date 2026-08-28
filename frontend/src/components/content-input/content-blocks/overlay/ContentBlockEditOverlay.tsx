import {
  Button,
  Group,
  Modal,
  Stack,
  type ModalProps,
} from "@mantine/core";
import type {ContentPageBlockMetadata, ContentPageBlockValue} from "@/types/content-page.ts";
import useContentBlockData from "@/hooks/content-blocks/useContentBlockData.tsx";
import FeedbackState from "@/components/feedback-state";
import {CheckIcon} from "@phosphor-icons/react";
import {useEffect, useRef, useState} from "react";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import {CONTENT_BLOCK_EDITOR_OVERLAY_BODY} from "@/components/content-input/content-blocks/overlay/registry.ts";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";

type ContentBlockEditModalProps = {
  blockMetadata: ContentPageBlockMetadata;
  onUpdate: () => void;
} & ModalProps

export default function ContentBlockEditOverlay({
  blockMetadata,
  onUpdate,
  opened,
  onClose,
  withOverlay = true,
  overlayProps,
  ...props
}: ContentBlockEditModalProps) {
  const [draftMetadata, setDraftMetadata] = useState(blockMetadata);
  const { blockData, isLoading, upsertBlockContent } = useContentBlockData(draftMetadata);
  const content = useRef<ContentPageBlockValue>(blockData);

  const EditorBody
    = CONTENT_BLOCK_EDITOR_OVERLAY_BODY[blockMetadata.collectionName as ContentPageBlockType];

  useEffect(() => {
    content.current = blockData;
  }, [blockData]);

  const handleUpdate = async () => {
    await upsertBlockContent(content.current);
    onUpdate();
  };

  return (
    <Modal.Root
      {...props}
      centered
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      size="xl"
    >
      {withOverlay && <Modal.Overlay {...overlayProps} />}
      <Modal.Content>
        {!isLoading && (
          <Modal.Header mb={0} pb={0}>
            <Modal.CloseButton />
          </Modal.Header>
        )}
        <Modal.Body pt={0}>
          {isLoading && !blockData ? (
            <FeedbackState title="Carregando conteúdo..." loading />
          ) : (
            <Stack gap="lg">
              <TitleInput
                label="Título"
                placeholder="Digite um título"
                value={draftMetadata.title}
                onChange={(event) => {
                  const title = event.currentTarget.value;
                  setDraftMetadata((current) => ({ ...current, title }));
                }}
                disabled={isLoading}
              />

              <EditorBody
                content={blockData as string}
                onChange={(value) => content.current = value}
              />

              <Group justify="flex-end">
                <Button
                  variant="outline"
                  color="brand"
                  size="sm"
                  loading={isLoading}
                  leftSection={<CheckIcon aria-hidden size={16} />}
                  onClick={() => void handleUpdate()}
                >
                  Salvar
                </Button>
              </Group>
            </Stack>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
