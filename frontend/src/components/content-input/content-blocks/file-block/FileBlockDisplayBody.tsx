import {Loader} from "@mantine/core";
import type {BlockDisplayBodyProps} from "@/components/content-input/content-blocks/registry.ts";
import FileBlockCarousel from "@/components/content-input/content-blocks/file-block/FileBlockCarousel.tsx";

export default function FileBlockDisplayBody({ isLoading, content }: BlockDisplayBodyProps) {
  const urls = typeof content === "object" ? content.urls : [];

  if (isLoading) {
    return <Loader />;
  }

  return <FileBlockCarousel urls={urls} />;
}
