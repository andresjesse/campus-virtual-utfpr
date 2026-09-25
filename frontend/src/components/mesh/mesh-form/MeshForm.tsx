import {Button, Group, Space, Stack, Textarea} from "@mantine/core";
import { useState } from "react";
import type { FormEvent } from "react";

import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import messages from "@/constants/messages.json";
import { getMeshIdentifierError } from "@/helpers/mesh-service-helper.ts";
import MeshGlbDropzone from "@/components/mesh/mesh-glb-dropzone/MeshGlbDropzone.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import type { MeshCurrentFile, MeshFormValues } from "@/types/mesh.ts";

type MeshFormProps = {
  initialValues: MeshFormValues;
  isEditing: boolean;
  currentFile?: MeshCurrentFile;
  isSaving: boolean;
  onSubmit: (values: MeshFormValues) => void;
};

export default function MeshForm({
  initialValues,
  isEditing,
  currentFile,
  onSubmit,
  isSaving
}: MeshFormProps) {
  const [values, setValues] = useState<MeshFormValues>(initialValues);
  const [nameTouched, setNameTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nameError =
    nameTouched || submitAttempted ? getMeshIdentifierError(values.name) : undefined;
  const fileError =
    submitAttempted && !isEditing && !values.file
      ? messages.mesh.editor.fileRequiredError
      : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameTouched(true);
    setSubmitAttempted(true);

    if (getMeshIdentifierError(values.name)) return;
    if (!isEditing && !values.file) return;

    onSubmit(values);
  }

  return (
    <form id="mesh-form" onSubmit={handleSubmit}>
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
