import type {BlockEditorProps} from "@/components/content-input/content-blocks/overlay/registry.ts";
import DropzoneSection from "@/components/content-input/content-blocks/overlay/file-block/DropzoneSection.tsx";
import FilesPreviewSection from "@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx";
import { Space } from "@mantine/core";

export default function FileBlockEditor({ content, onChange }: BlockEditorProps) {
  return (
    <section>
      <DropzoneSection />
      <Space h="lg" />
      <FilesPreviewSection content={content} />
    </section>
  );
}