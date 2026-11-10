import { Button, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { FormEvent } from "react";

import TitleInput from "@/components/text-input/TitleInput.tsx";
import messages from "@/constants/messages.json";
import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import { getMenuCategoryLabelError } from "@/helpers/menu-category-service-helper.ts";
import {
  getRequestErrorMessage,
  getRequestFieldErrors,
} from "@/helpers/request-error-helper.ts";
import type { MenuCategoryFormValues } from "@/types/menu.ts";

type MenuCategoryFormProps = {
  initialValues: MenuCategoryFormValues;
  onSubmit: (values: MenuCategoryFormValues) => Promise<void>;
};

type FailedSubmit = {
  label: string;
  error: unknown;
};

export default function MenuCategoryForm({
  initialValues,
  onSubmit,
}: MenuCategoryFormProps) {
  const [values, setValues] = useState<MenuCategoryFormValues>(initialValues);
  const [labelTouched, setLabelTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failedSubmit, setFailedSubmit] = useState<FailedSubmit>();

  const validationError =
    labelTouched || submitAttempted
      ? getMenuCategoryLabelError(values.label)
      : undefined;
  const serverLabelError =
    failedSubmit &&
    failedSubmit.label === values.label.trim() &&
    "label" in getRequestFieldErrors(failedSubmit.error)
      ? getRequestErrorMessage(failedSubmit.error, messages.menuCategories.errors)
      : undefined;
  const labelError = validationError ?? serverLabelError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLabelTouched(true);
    setSubmitAttempted(true);

    if (getMenuCategoryLabelError(values.label)) return;
    // The server already refused this label; don't spend a round trip on it again.
    if (serverLabelError) return;

    setIsSaving(true);

    try {
      await onSubmit(values);
      setFailedSubmit(undefined);
    } catch (submitError) {
      setFailedSubmit({ label: values.label.trim(), error: submitError });
      notifications.show({
        color: "red",
        title: messages.common.saveError,
        message: getRequestErrorMessage(submitError, messages.menuCategories.errors),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form id="menu-category-form" onSubmit={(event) => void handleSubmit(event)}>
      <Stack h="100%" gap={0}>
        <FormMetadataSection>
          <TitleInput
            withAsterisk
            label={messages.menuCategories.editor.labelLabel}
            placeholder={messages.menuCategories.editor.labelPlaceholder}
            value={values.label}
            error={labelError}
            onBlur={() => setLabelTouched(true)}
            onChange={(event) =>
              setValues({ ...values, label: event.currentTarget.value })
            }
          />
        </FormMetadataSection>
        <FormBodySection flex="1 1 auto" pt="lg">
          <Group justify="flex-end" py="lg">
            <Button
              variant="outline"
              color="brand"
              size="sm"
              type="submit"
              form="menu-category-form"
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
