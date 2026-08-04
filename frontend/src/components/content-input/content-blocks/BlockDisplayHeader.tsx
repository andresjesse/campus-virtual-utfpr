import {ActionIcon, Flex, Space, Title} from "@mantine/core";
import {TrashIcon} from "@phosphor-icons/react/dist/csr/Trash";
import {NotePencilIcon} from "@phosphor-icons/react";
import type {ContentPageBlockMetadata} from "@/types/content-page.ts";

type RtfBlockDisplayHeaderProps = {
  metadata: ContentPageBlockMetadata
  onDelete: () => Promise<void>
}

export default function BlockDisplayHeader({ metadata, onDelete }: RtfBlockDisplayHeaderProps) {
  return (
    <Flex mb="xs" pb="0" flex={1} justify="space-between">
      <Title order={4}>{metadata.title}</Title>
      <Flex align="center">
        <ActionIcon
          aria-label={`Editar conteúdo"}`}
          color="blue"
          variant="subtle"
          size="md"
          loading={false}
          onClick={(event) => {
            event.stopPropagation();
            return
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <NotePencilIcon size={18} />
        </ActionIcon>

        <Space w="sm" />

        <ActionIcon
          aria-label={`Excluir conteúdo"}`}
          color="red"
          variant="subtle"
          size="md"
          loading={false}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <TrashIcon aria-hidden size={18} />
        </ActionIcon>
      </Flex>
    </Flex>
  );
}