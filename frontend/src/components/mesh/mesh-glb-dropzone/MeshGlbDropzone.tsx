import { ActionIcon, Button } from "@mantine/core";
import { useState } from "react";

import DropzoneSection from "@/components/content-input/DropzoneSection.tsx";
import MeshFileCard from "@/components/mesh/mesh-file-card/MeshFileCard.tsx";
import {
  MESH_FILE_ACCEPT,
  MESH_FILE_MAX_SIZE_IN_BYTES,
} from "@/constants/mesh-constants.ts";
import messages from "@/constants/messages.json";
import { formatFileSize } from "@/helpers/conversion-helper.ts";
import type { MeshCurrentFile } from "@/types/mesh.ts";
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/csr/CloudArrowUp";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type MeshGlbDropzoneProps = {
  onChange: (file: File | null) => void;
  value: File | null;
  currentFile?: MeshCurrentFile;
  error?: string;
};

export default function MeshGlbDropzone({
  onChange,
  value,
  currentFile,
  error,
}: MeshGlbDropzoneProps) {
  const [isReplacing, setIsReplacing] = useState(false);

  if (value) {
    return (
      <MeshFileCard
        title={value.name}
        subtitle={formatFileSize(value.size)}
        action={
          <ActionIcon
            aria-label={messages.mesh.editor.removeFileLabel}
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
      <MeshFileCard
        title={currentFile.name}
        subtitle={messages.mesh.editor.currentFileLabel}
        action={
          <Button variant="subtle" color="gray" size="xs" onClick={() => setIsReplacing(true)}>
            {messages.mesh.editor.replaceFileLabel}
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
        accept={MESH_FILE_ACCEPT}
        maxSizeInBytes={MESH_FILE_MAX_SIZE_IN_BYTES}
        icon={CloudArrowUpIcon}
        title={messages.mesh.editor.dropzoneTitle}
        description={messages.mesh.editor.dropzoneDescription}
        actionLabel={messages.common.selectFiles}
        error={error}
      />
      {currentFile && (
        <Button variant="outline" color="brand" size="xs" onClick={() => setIsReplacing(false)}>
          {messages.mesh.editor.cancelReplaceLabel}
        </Button>
      )}
    </>
  );
}
