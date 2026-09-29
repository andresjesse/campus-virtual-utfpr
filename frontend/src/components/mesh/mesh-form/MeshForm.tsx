import {Button, Group, Space, Stack, Textarea} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { FormEvent } from "react";

import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import messages from "@/constants/messages.json";
import { getMeshIdentifierError } from "@/helpers/mesh-service-helper.ts";
import {
  getRequestErrorMessage,
  getRequestFieldErrors,
} from "@/helpers/request-error-helper.ts";
import MeshGlbDropzone from "@/components/mesh/mesh-glb-dropzone/MeshGlbDropzone.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import type { MeshCurrentFile, MeshFormValues } from "@/types/mesh.ts";

type MeshFormProps = {
  initialValues: MeshFormValues;
  isEditing: boolean;
  currentFile?: MeshCurrentFile;
  onSubmit: (values: MeshFormValues) => Promise<void>;
};

type FailedSubmit = {
  name: string;
  error: unknown;
};

export default function MeshForm({
  initialValues,
  isEditing,
  currentFile,
  onSubmit,
}: MeshFormProps) {
  const [values, setValues] = useState<MeshFormValues>(initialValues);
  const [nameTouched, setNameTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failedSubmit, setFailedSubmit] = useState<FailedSubmit>();

  const validationError =
    nameTouched || submitAttempted ? getMeshIdentifierError(values.name) : undefined;
  const serverNameError =
    failedSubmit &&
    failedSubmit.name === values.name.trim() &&
    "name" in getRequestFieldErrors(failedSubmit.error)
      ? getRequestErrorMessage(failedSubmit.error, messages.mesh.errors)
      : undefined;
  const nameError = validationError ?? serverNameError;
  const fileError =
    submitAttempted && !isEditing && !values.file
      ? messages.mesh.editor.fileRequiredError
      : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);
    setSubmitAttempted(true);

    if (getMeshIdentifierError(values.name)) return;
    // The server already refused this identifier; don't spend a round trip on it again.
    if (serverNameError) return;
    if (!isEditing && !values.file) return;

    setIsSaving(true);

    try {
      await onSubmit(values);
      setFailedSubmit(undefined);
    } catch (submitError) {
      setFailedSubmit({ name: values.name.trim(), error: submitError });
      notifications.show({
        color: "red",
        title: messages.common.saveError,
        message: getRequestErrorMessage(submitError, messages.mesh.errors),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="mesh-form" onSubmit={(event) => void handleSubmit(event)}>
      <Stack h="100%" gap={0}>
        <FormMetadataSection>
          <TitleInput
            label={messages.mesh.editor.nameLabel}
            placeholder={messages.mesh.editor.namePlaceholder}
            value={values.name}
            error={nameError}
            onBlur={() => setNameTouched(true)}
            onChange={(event) =>
              setValues({ ...values, name: event.currentTarget.value })
            }
          />
        </FormMetadataSection>
        <FormBodySection flex="1 1 auto" pt="lg">
          <Textarea
            label={messages.mesh.editor.descriptionLabel}
            placeholder={messages.mesh.editor.descriptionPlaceholder}
            value={values.description}
            autosize
            minRows={2}
            maxRows={5}
            onChange={(event) =>
              setValues({ ...values, description: event.currentTarget.value })
            }
          />

          <Space h="xl" />

          <MeshGlbDropzone
            value={values.file}
            currentFile={currentFile}
            onChange={(file) => setValues({ ...values, file })}
            error={fileError}
          />

          <Group justify="flex-end" py="lg">
            <Button
              variant="outline"
              color="brand"
              size="sm"
              type="submit"
              form="mesh-form"
              loading={isSaving}
            >
              {messages.common.save}
            </Button>
          </Group>
        </FormBodySection>
      </Stack>
    </form>
  );
}
