import type {BlockEditorProps} from "@/components/content-input/content-blocks/overlay/registry.ts";
import DropzoneSection from "@/components/content-input/content-blocks/overlay/file-block/DropzoneSection.tsx";
import FilesPreviewSection from "@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx";
import { Space } from "@mantine/core";
import {useRef, useState} from "react";

export default function FileBlockEditor({ content, onChange }: BlockEditorProps) {
  const [currentFilesUrl, setCurrentFilesUrl] = useState<string[]>([content].flat() as string[]);
  const pendingFilesRef = useRef<File[]>([]);

  const handleDrop = (files: File[]) => {
    const nextFiles = [...pendingFilesRef.current, ...files];
    pendingFilesRef.current = nextFiles;

    const newFilesUrl = files.map((file) => URL.createObjectURL(file));
    setCurrentFilesUrl((current) => current.concat(newFilesUrl));
    onChange(nextFiles);
  }

  return (
    <section>
      <DropzoneSection onDrop={handleDrop} />
      <Space h="lg" />
      <FilesPreviewSection content={currentFilesUrl} />
    </section>
  );
}