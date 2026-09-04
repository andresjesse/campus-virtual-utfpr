import {Loader} from "@mantine/core";
import type {BlockDisplayBodyProps} from "@/components/content-input/content-blocks/registry.ts";
import FilesPreviewSection from "@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx";

export default function FileBlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  const imagesContent = typeof content === "object" ? content.urls : [];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <FilesPreviewSection content={imagesContent} interactive={false} />
  );
}