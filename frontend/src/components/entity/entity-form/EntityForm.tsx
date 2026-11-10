import { Box, Button, Checkbox, Flex, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { FormEvent } from "react";

import EntityMeshSelect from "@/components/entity/entity-mesh-select/EntityMeshSelect.tsx";
import EntityTransformRow from "@/components/entity/entity-transform-row/EntityTransformRow.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import messages from "@/constants/messages.json";
import { validateEntityForm } from "@/helpers/entity-service-helper.ts";
import {
  getRequestErrorMessage,
  getRequestFieldErrors,
} from "@/helpers/request-error-helper.ts";
import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import type {
  EntityFormValues,
  EntityMeshOption,
  EntityTransformAxis,
  EntityTransformGroup,
  EntityTransformValue,
} from "@/types/entity.ts";

const GROUP_LABELS: Record<EntityTransformGroup, string> = {
  pos: messages.entities.editor.groupPosition,
  rotation: messages.entities.editor.groupRotation,
  scale: messages.entities.editor.groupScale,
};

type EntityFormProps = {
  initialValues: EntityFormValues;
  meshOptions: EntityMeshOption[];
  onSubmit: (values: EntityFormValues) => Promise<void>;
};

type FailedSubmit = {
  slug: string;
  error: unknown;
};

export default function EntityForm({
  initialValues,
  meshOptions,
  onSubmit,
}: EntityFormProps) {
  const [values, setValues] = useState<EntityFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof EntityFormValues, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failedSubmit, setFailedSubmit] = useState<FailedSubmit>();

  const validationErrors = validateEntityForm(values);

  function errorFor(field: keyof EntityFormValues) {
    return submitAttempted || touched[field] ? validationErrors[field] : undefined;
  }

  function touch(field: keyof EntityFormValues) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  const serverSlugError =
    failedSubmit &&
    failedSubmit.slug === values.slug.trim() &&
    "slug" in getRequestFieldErrors(failedSubmit.error)
      ? getRequestErrorMessage(failedSubmit.error, messages.entities.errors)
      : undefined;
  const slugError = errorFor("slug") ?? serverSlugError;

  function transformRowProps(group: EntityTransformGroup) {
    return {
      groupLabel: GROUP_LABELS[group],
      values: {
        x: values[`${group}_x`],
        y: values[`${group}_y`],
        z: values[`${group}_z`],
      },
      errors: {
        x: errorFor(`${group}_x`),
        y: errorFor(`${group}_y`),
        z: errorFor(`${group}_z`),
      },
      onBlur: (axis: EntityTransformAxis) => touch(`${group}_${axis}`),
      onChange: (axis: EntityTransformAxis, value: EntityTransformValue) =>
        setValues((current) => ({ ...current, [`${group}_${axis}`]: value })),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(validationErrors).length > 0) return;
    // The server already refused this slug; don't spend a round trip on it again.
    if (serverSlugError) return;

    setIsSaving(true);

    try {
      await onSubmit(values);
      setFailedSubmit(undefined);
    } catch (submitError) {
      setFailedSubmit({ slug: values.slug.trim(), error: submitError });
      notifications.show({
        color: "red",
        title: messages.common.saveError,
        message: getRequestErrorMessage(submitError, messages.entities.errors),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="entity-form" onSubmit={(event) => void handleSubmit(event)}>
      <Stack h="100%" gap={0}>
        <FormMetadataSection>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: "1rem", md: "1.5rem" }}
            align={{ md: "flex-end" }}
          >
            <Box w={{ base: "100%", md: "16rem" }}>
              <TitleInput
                withAsterisk
                label={messages.entities.editor.slugLabel}
                placeholder={messages.entities.editor.slugPlaceholder}
                value={values.slug}
                error={slugError}
                onBlur={() => touch("slug")}
                onChange={(event) =>
                  setValues({ ...values, slug: event.currentTarget.value })
                }
              />
            </Box>
            <Box w={{ base: "100%", md: "16rem" }}>
              <EntityMeshSelect
                options={meshOptions}
                value={values.mesh}
                error={errorFor("mesh")}
                onBlur={() => touch("mesh")}
                onChange={(mesh) => setValues({ ...values, mesh })}
              />
            </Box>
            <Checkbox
              color="brand"
              label={messages.entities.editor.isActiveLabel}
              checked={values.is_active}
              ml={{ md: "auto" }}
              pb={{ md: "0.4rem" }}
              onChange={(event) =>
                setValues({ ...values, is_active: event.currentTarget.checked })
              }
            />
          </Flex>
        </FormMetadataSection>

        <FormBodySection flex="1 1 auto" pt="lg">
          <Stack h="100%" gap="lg">
            <EntityTransformRow {...transformRowProps("pos")} />
            <EntityTransformRow {...transformRowProps("rotation")} />
            <EntityTransformRow {...transformRowProps("scale")} />

            <Group justify="flex-end" py="lg" mt="auto">
              <Button
                variant="outline"
                color="brand"
                size="sm"
                type="submit"
                form="entity-form"
                loading={isSaving}
              >
                {messages.common.save}
              </Button>
            </Group>
          </Stack>
        </FormBodySection>
      </Stack>
    </form>
  );
}
