import type {BlockEditorProps} from "@/components/content-input/content-blocks/overlay/registry.ts";
import DropzoneSection from "@/components/content-input/content-blocks/overlay/file-block/DropzoneSection.tsx";
import FilesPreviewSection from "@/components/content-input/content-blocks/overlay/file-block/FilesPreviewSection.tsx";
import { Space } from "@mantine/core";
import {useEffect, useRef, useState} from "react";
import type {FileBlockContentValue} from "@/types/content-page.ts";

type PendingImage = {
  file: File;
  url: string;
}

export default function FileBlockEditor({ content, onChange }: BlockEditorProps) {
  const [existingUrls] = useState<string[]>(
    () => (typeof content === "object" ? content.urls : []),
  );
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [deletionMarked, setDeletionMarked] = useState<string[]>([]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const pendingRef = useRef<PendingImage[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  const handleDrop = (files: File[]) => {
    const newPending = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPending((current) => [...current, ...newPending]);
  };

  const handleToggleDelete = (url: string) => {
    setDeletionMarked((current) =>
      current.includes(url)
        ? current.filter((item) => item !== url)
        : [...current, url],
    );
  };

  useEffect(() => {
    const marked = new Set(deletionMarked);
    const contentValue: FileBlockContentValue = {
      newFiles: pending.filter((item) => !marked.has(item.url)).map((item) => item.file),
      deletedUrls: existingUrls.filter((url) => marked.has(url)),
      urls: existingUrls,
    };
    onChangeRef.current(contentValue);
  }, [existingUrls, deletionMarked, pending]);

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const previewUrls = [...existingUrls, ...pending.map((item) => item.url)];

  return (
    <section>
      <DropzoneSection onDrop={handleDrop} />
      <Space h="lg" />
      <FilesPreviewSection
        content={previewUrls}
        markedUrls={deletionMarked}
        onToggleDelete={handleToggleDelete}
      />
    </section>
  );
}