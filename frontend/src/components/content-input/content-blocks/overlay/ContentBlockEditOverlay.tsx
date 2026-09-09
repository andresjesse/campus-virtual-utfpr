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
import {type ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import {notifications} from "@mantine/notifications";
import {
  getEmptyContentNotification,
  getPageMetadataNotification,
  isBlockContentEmpty,
  isPageMetadataReady,
} from "@/helpers/content-block-validation.ts";
import messages from "@/constants/messages.json";

type ContentBlockEditModalProps = {
  blockMetadata: ContentPageBlockMetadata;
  pageTitle?: string;
  pageRelation?: string;
  onUpdate: () => void;
} & ModalProps

export default function ContentBlockEditOverlay({
  blockMetadata,
  pageTitle = "",
  pageRelation = "",
  onUpdate,
  opened,
  onClose,
  withOverlay = true,
  overlayProps,
  ...props
}: ContentBlockEditModalProps) {
  const [draftMetadata, setDraftMetadata] = useState(blockMetadata);
  const [isSaving, setIsSaving] = useState(false);
  const { blockData, isLoading, upsertBlockContent } = useContentBlockData(draftMetadata);
  const content = useRef<ContentPageBlockValue>(blockData);

  const EditorBody
    = CONTENT_BLOCK_EDITOR_OVERLAY_BODY[blockMetadata.collectionName as ContentPageBlockType];

  useEffect(() => {
    content.current = blockData;
  }, [blockData, blockMetadata.collectionName]);

  const handleUpdate = async () => {
    const isNewBlock = !draftMetadata.id;

    if (!isPageMetadataReady(pageTitle, pageRelation)) {
      const { title, message } = getPageMetadataNotification(
        pageTitle,
        pageRelation,
      );
      notifications.show({ color: "yellow", title, message });
      return;
    }

    if (isBlockContentEmpty(blockMetadata.collectionName, content.current)) {
      const { title, message } = getEmptyContentNotification(
        blockMetadata.collectionName,
        isNewBlock,
      );
      notifications.show({ color: "yellow", title, message });
      return;
    }

    setIsSaving(true);
    try {
      await upsertBlockContent(content.current);
      onUpdate();
      notifications.show({
        color: "green",
        title: "Conteúdo atualizado",
        message: "O conteúdo foi atualizado com sucesso."
      })
    }
    catch {
      notifications.show({
        color: "red",
        title: "Falha ao atualizar o conteúdo",
        message: "Não foi possível atualizar o conteúdo. Os dados permanecem os mesmos."
      })
    }
    finally {
      setIsSaving(false);
    }
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
                content={blockData}
                onChange={(value) => content.current = value}
              />
            </Stack>
          )}

          <Group
            justify="flex-end"
            mt="lg"
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 1,
              paddingTop: 8,
              paddingBottom: 8,
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Button
              variant="outline"
              color="brand"
              size="sm"
              loading={isSaving}
              leftSection={<CheckIcon aria-hidden size={16} />}
              onClick={() => void handleUpdate()}
            >
              {messages.block.editor.save}
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
