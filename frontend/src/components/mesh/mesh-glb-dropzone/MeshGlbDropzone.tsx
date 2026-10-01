import SingleFileDropzone from "@/components/file/SingleFileDropzone.tsx";
import {
  MESH_FILE_ACCEPT,
  MESH_FILE_MAX_SIZE_IN_BYTES,
} from "@/constants/mesh-constants.ts";
import messages from "@/constants/messages.json";
import type { MeshCurrentFile } from "@/types/mesh.ts";
import { FileArchiveIcon } from "@phosphor-icons/react/dist/csr/FileArchive";

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
  return (
    <SingleFileDropzone
      value={value}
      accept={MESH_FILE_ACCEPT}
      maxSizeInBytes={MESH_FILE_MAX_SIZE_IN_BYTES}
      fileIcon={FileArchiveIcon}
      labels={{
        dropzoneTitle: messages.mesh.editor.dropzoneTitle,
        dropzoneDescription: messages.mesh.editor.dropzoneDescription,
        removeLabel: messages.mesh.editor.removeFileLabel,
        currentFileLabel: messages.mesh.editor.currentFileLabel,
        replaceLabel: messages.mesh.editor.replaceFileLabel,
        cancelReplaceLabel: messages.mesh.editor.cancelReplaceLabel,
      }}
      currentFile={currentFile}
      error={error}
      onChange={onChange}
    />
  );
}
