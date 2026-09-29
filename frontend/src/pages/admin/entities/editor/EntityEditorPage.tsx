import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import EntityForm from "@/components/entity/entity-form/EntityForm";
import FeedbackState from "@/components/feedback-state";
import { ENTITY_DEFAULT_TRANSFORM } from "@/constants/entity-constants";
import messages from "@/constants/messages.json";
import {
  toEntityFormValues,
  toEntityMeshOptions,
} from "@/helpers/entity-service-helper";
import { getRequestErrorMessage } from "@/helpers/request-error-helper";
import { createEntity, getEntity, updateEntity } from "@/services/entity-service";
import { listMeshes } from "@/services/mesh-service";
import type { EntityFormValues, EntityMeshOption } from "@/types/entity";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";

const EMPTY_ENTITY: EntityFormValues = {
  ...ENTITY_DEFAULT_TRANSFORM,
  slug: "",
  mesh: "",
  is_active: true,
};

export default function EntityEditorPage() {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<EntityFormValues>(EMPTY_ENTITY);
  const [meshOptions, setMeshOptions] = useState<EntityMeshOption[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadEditor = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [meshes, loadedEntity] = await Promise.all([
        listMeshes(),
        entityId ? getEntity(entityId) : undefined,
      ]);

      setMeshOptions(toEntityMeshOptions(meshes));

      if (loadedEntity) {
        setEntity(toEntityFormValues(loadedEntity));
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [entityId]);

  const handleSubmit = useCallback(
    async (values: EntityFormValues) => {
      if (entityId) {
        await updateEntity(entityId, values);
      } else {
        await createEntity(values);
      }

      notifications.show({
        color: "green",
        title: messages.entities.editor.saveSuccessTitle,
        message: messages.entities.editor.saveSuccessMessage,
      });
      navigate("/admin/entities");
    },
    [entityId, navigate],
  );

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  if (isLoading) {
    return <FeedbackState loading title={messages.entities.editor.loading} />;
  }

  if (!isLoading && error) {
    return (
      <FeedbackState
        title={messages.entities.list.loadErrorTitle}
        description={error}
        actionLabel={messages.common.retry}
        onAction={() => void loadEditor()}
      />
    );
  }

  return (
    <EditorPageContainer
      navRoute="/admin/entities"
      ariaLabel={
        entityId ? messages.entities.editor.editTitle : messages.entities.editor.newTitle
      }
    >
      <EntityForm
        key={entityId ?? "new"}
        initialValues={entity}
        meshOptions={meshOptions}
        onSubmit={handleSubmit}
      />
    </EditorPageContainer>
  );
}
