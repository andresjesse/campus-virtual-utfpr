import {Flex, Space, Title} from "@mantine/core";
import {TrashIcon} from "@phosphor-icons/react/dist/csr/Trash";
import {NotePencilIcon} from "@phosphor-icons/react";

type RtfBlockDisplayHeaderProps = {
  title: string
}

export default function BlockDisplayHeader({ title }: RtfBlockDisplayHeaderProps) {
  return (
    <Flex mb="xs" pb="0" flex={1} justify="space-between">
      <Title order={4}>{title}</Title>
      <Flex align="center">
        <NotePencilIcon size={20} />
        <Space w="sm" />
        <TrashIcon size={20} />
      </Flex>
    </Flex>
  );
}