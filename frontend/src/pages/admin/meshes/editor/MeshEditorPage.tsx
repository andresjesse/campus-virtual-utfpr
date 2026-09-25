import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import FeedbackState from "@/components/feedback-state";
import MeshForm from "@/components/mesh/mesh-form/MeshForm";
import messages from "@/constants/messages.json";
import { getRequestErrorMessage } from "@/helpers/request-error-helper";
import { createMesh, getMesh, updateMesh } from "@/services/mesh-service";
import type { MeshCurrentFile, MeshFormValues } from "@/types/mesh";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";

const EMPTY_MESH: MeshFormValues = {
  name: "",
  description: "",
  file: null
}

export default function MeshEditorPage() {
  const { meshId } = useParams();
  const navigate = useNavigate();
  const [mesh, setMesh] = useState<MeshFormValues>(EMPTY_MESH);
  const [currentFile, setCurrentFile] = useState<MeshCurrentFile>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadEditor = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      if (meshId) {
        const loadedMesh = await getMesh(meshId)
        // `file` only holds a newly selected file; the stored one is `currentFile`.
        setMesh({name: loadedMesh.name, description: loadedMesh.description, file: null})
        setCurrentFile({name: loadedMesh.file})
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [meshId]);

  const handleSubmit = useCallback(
    async (values: MeshFormValues) => {
      setIsSaving(true);

      try {
        if (meshId) {
          await updateMesh(meshId, values);
        } else {
          await createMesh(values);
        }

        notifications.show({
          color: "green",
          title: messages.mesh.editor.saveSuccessTitle,
          message: messages.mesh.editor.saveSuccessMessage,
        });
        navigate("/admin/meshes");
      } catch (submitError) {
        notifications.show({
          color: "red",
          title: messages.common.saveError,
          message: getRequestErrorMessage(submitError),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [meshId, navigate],
  );

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  if (isLoading) {
    return <FeedbackState loading title={messages.mesh.editor.loading} />
  }

  if (!isLoading && error) {
    return (
      <FeedbackState
        title={messages.mesh.list.loadErrorTitle}
        description={error}
        actionLabel={messages.common.retry}
        onAction={() => void loadEditor()}
      />
    )
  }

  return (
    <EditorPageContainer
      navRoute="/admin/meshes"
      ariaLabel={meshId ? messages.mesh.editor.editTitle : messages.mesh.editor.newTitle}
    >
      <MeshForm
        key={meshId ?? "new"}
        initialValues={mesh}
        isEditing={Boolean(meshId)}
        currentFile={currentFile}
        onSubmit={(values) => void handleSubmit(values)}
        isSaving={isSaving}
      />
    </EditorPageContainer>
  );
}
