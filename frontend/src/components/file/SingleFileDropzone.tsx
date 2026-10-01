import { ActionIcon, Button } from "@mantine/core";
import type { Icon } from "@phosphor-icons/react";
import { useState } from "react";

import DropzoneSection from "@/components/content-input/DropzoneSection.tsx";
import FileCard from "@/components/file/FileCard.tsx";
import messages from "@/constants/messages.json";
import { formatFileSize } from "@/helpers/conversion-helper.ts";
import type {
  CurrentFile,
  DropzoneAccept,
  SingleFileDropzoneLabels,
} from "@/types/file.ts";
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/csr/CloudArrowUp";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type SingleFileDropzoneProps = {
  value: File | null;
  accept: DropzoneAccept;
  maxSizeInBytes: number;
  fileIcon: Icon;
  labels: SingleFileDropzoneLabels;
  currentFile?: CurrentFile;
  error?: string;
  onChange: (file: File | null) => void;
};

export default function SingleFileDropzone({
  value,
  accept,
  maxSizeInBytes,
  fileIcon,
  labels,
  currentFile,
  error,
  onChange,
}: SingleFileDropzoneProps) {
  const [isReplacing, setIsReplacing] = useState(false);

  if (value) {
    return (
      <FileCard
        icon={fileIcon}
        title={value.name}
        subtitle={formatFileSize(value.size)}
        action={
          <ActionIcon
            aria-label={labels.removeLabel}
            color="red"
            variant="subtle"
            size="sm"
            onClick={() => {
              setIsReplacing(false);
              onChange(null);
            }}
          >
            <XIcon aria-hidden size={15} />
          </ActionIcon>
        }
      />
    );
  }

  if (currentFile && !isReplacing) {
    return (
      <FileCard
        icon={fileIcon}
        title={currentFile.name}
        subtitle={labels.currentFileLabel}
        action={
          <Button variant="subtle" color="gray" size="xs" onClick={() => setIsReplacing(true)}>
            {labels.replaceLabel}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DropzoneSection
        layout="stacked"
        multiple={false}
        onDrop={(files) => onChange(files[0] ?? null)}
        accept={accept}
        maxSizeInBytes={maxSizeInBytes}
        icon={CloudArrowUpIcon}
        title={labels.dropzoneTitle}
        description={labels.dropzoneDescription}
        actionLabel={messages.common.selectFiles}
        error={error}
      />
      {currentFile && (
        <Button variant="outline" color="brand" size="xs" onClick={() => setIsReplacing(false)}>
          {labels.cancelReplaceLabel}
        </Button>
      )}
    </>
  );
}
