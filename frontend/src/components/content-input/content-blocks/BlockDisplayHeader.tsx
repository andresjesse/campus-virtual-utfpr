import {ActionIcon, Flex, Space, Title} from "@mantine/core";
import {TrashIcon} from "@phosphor-icons/react/dist/csr/Trash";
import {NotePencilIcon} from "@phosphor-icons/react";
import type {ContentPageBlockMetadata} from "@/types/content-page.ts";
import type {ContentPageBlockType} from "@/enums/content-pages-enum.ts";
import messages from "@/constants/messages.json";
import {formatMessage} from "@/helpers/message-helper.ts";
import type {ReactNode} from "react";

import classes from "@/components/action/touch-action-icon.module.css";

type RtfBlockDisplayHeaderProps = {
  metadata: ContentPageBlockMetadata
  actions?: ReactNode
  onDelete: () => Promise<void>
  onEdit: (blockId: string, collectionName: ContentPageBlockType) => void
}

export default function BlockDisplayHeader({ metadata, actions, onDelete, onEdit }: RtfBlockDisplayHeaderProps) {
  const blockName = metadata.title || messages.block.list.untitled;

  return (
    <Flex mb="xs" pb="0" flex={1} justify="space-between" align="center" wrap="wrap" gap="xs">
      <Title order={4} flex="1 1 12rem" miw={0} style={{ overflowWrap: "anywhere" }}>
        {metadata.title}
      </Title>
      <Flex align="center" ml="auto" flex="0 0 auto">
        {actions && (
          <>
            {actions}
            <Space w="sm" />
          </>
        )}

        <ActionIcon
          aria-label={formatMessage(messages.block.list.editAriaLabel, blockName)}
          color="blue"
          variant="subtle"
          size="md"
          className={classes.action}
          loading={false}
          onClick={(event) => {
            event.stopPropagation();
            void onEdit(metadata.id!, metadata.collectionName as ContentPageBlockType);
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <NotePencilIcon size={18} />
        </ActionIcon>

        <Space w="sm" />

        <ActionIcon
          aria-label={formatMessage(messages.block.list.deleteAriaLabel, blockName)}
          color="red"
          variant="subtle"
          size="md"
          className={classes.action}
          loading={false}
          onClick={(event) => {
            event.stopPropagation();
            void onDelete();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TrashIcon aria-hidden size={18} />
        </ActionIcon>
      </Flex>
    </Flex>
  );
}
