import { ActionIcon, Group, Text } from "@mantine/core";

import DropzoneSection from "@/components/content-input/DropzoneSection.tsx";
import { branding } from "@/config/branding.ts";
import {
  MESH_FILE_ACCEPT,
  MESH_FILE_MAX_SIZE_IN_BYTES,
} from "@/constants/mesh-constants.ts";
import messages from "@/constants/messages.json";
import { formatFileSize } from "@/helpers/conversion-helper.ts";
import { FileArchiveIcon } from "@phosphor-icons/react/dist/csr/FileArchive";
import { CloudArrowUpIcon } from "@phosphor-icons/react/dist/csr/CloudArrowUp";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

type MeshGlbDropzoneProps = {
  onChange: (file: File | null) => void;
  value: File | null;
};

export default function MeshGlbDropzone({
  onChange,
  value,
}: MeshGlbDropzoneProps) {
  if (value) {
    return (
      <Group
        justify="space-between"
        align="center"
        gap="sm"
        p="md"
        bg={branding.colors.surface.interactive}
        bd={`1px solid ${branding.colors.border.default}`}
        bdrs={8}
      >
        <Group gap="sm" align="center" style={{ minWidth: 0 }}>
          <FileArchiveIcon aria-hidden size={24} color={branding.colors.text.muted} />
          <div style={{ minWidth: 0 }}>
            <Text size="sm" truncate>
              {value.name}
            </Text>
            <Text size="xs" c="dimmed">
              {formatFileSize(value.size)}
            </Text>
          </div>
        </Group>
        <ActionIcon
          aria-label={messages.mesh.editor.removeFileLabel}
          color="red"
          variant="subtle"
          size="sm"
          onClick={() => onChange(null)}
        >
          <XIcon aria-hidden size={15} />
        </ActionIcon>
      </Group>
    );
  }

  return (
    <DropzoneSection
      layout="stacked"
      multiple={false}
      onDrop={(files) => onChange(files[0] ?? null)}
      accept={MESH_FILE_ACCEPT}
      maxSizeInBytes={MESH_FILE_MAX_SIZE_IN_BYTES}
      icon={CloudArrowUpIcon}
      title={messages.mesh.editor.dropzoneTitle}
      description={messages.mesh.editor.dropzoneDescription}
      actionLabel={messages.mesh.editor.dropzoneAction}
    />
  );
}
