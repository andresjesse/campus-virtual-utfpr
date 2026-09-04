import {Flex, Loader} from "@mantine/core";
import type {BlockDisplayBodyProps} from "@/components/content-input/content-blocks/registry.ts";
import PreviewImageCard from "@/components/content-input/content-blocks/overlay/file-block/PreviewImageCard.tsx";

export default function FileBlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  const imagesContent = typeof content === "object" ? content.urls : [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Flex
      gap="xs"
    >
      { imagesContent.map((fileUrl) => (<PreviewImageCard src={fileUrl} interactive={false} />)) }
    </Flex>
  );
}