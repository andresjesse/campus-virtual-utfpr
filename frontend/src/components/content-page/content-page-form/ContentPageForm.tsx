import {Box, Button, Flex, Group, Select, Stack} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { FormEvent } from "react";

import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page.ts";

import classes from "./content-page-form.module.css";
import BlocksList from "@/components/content-page/content-page-form/BlocksList.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import messages from "@/constants/messages.json";
import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";

type ContentPageFormProps = {
  initialValues: ContentPageFormValues;
  onSubmit: (values: ContentPageFormValues) => Promise<void>;
  relatedOptions: RelatedOption[];
};

export default function ContentPageForm({
  initialValues,
  onSubmit,
  relatedOptions,
}: ContentPageFormProps) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({ relation: false, title: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const titleError =
    (touched.title || submitAttempted) && !values.title.trim()
      ? messages.contentPages.editor.titleRequiredError
      : undefined;
  const relationError =
    (touched.relation || submitAttempted) && !values.relation
      ? messages.contentPages.editor.relationRequiredError
      : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ relation: true, title: true });
    setSubmitAttempted(true);

    if (!values.title.trim() || !values.relation) return;

    setIsSaving(true);

    try {
      await onSubmit({ ...values, title: values.title.trim() });
    } catch (submitError) {
      notifications.show({
        color: "red",
        title: messages.common.saveError,
        message: getRequestErrorMessage(submitError),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      id="content-page-form"
      onSubmit={(event) => void handleSubmit(event)}
      style={{ height: "100%" }}
    >
      <Stack h="100%" gap={0}>
        <FormMetadataSection>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={{ base: "1rem", md: "1.4rem" }}
          >
            <Box style={{ flex: "1.3 1 0" }}>
              <TitleInput
                withAsterisk
                label={messages.contentPages.editor.titleLabel}
                placeholder={messages.contentPages.editor.titlePlaceholder}
                value={values.title}
                error={titleError}
                onBlur={() =>
                  setTouched((current) => ({ ...current, title: true }))
                }
                onChange={(event) =>
                  setValues({ ...values, title: event.currentTarget.value })
                }
              />
            </Box>
            <Box miw={{ md: "11rem" }} style={{ flex: "0.8 1 0" }}>
              <Select
                searchable
                withAsterisk
                label={messages.contentPages.editor.relationLabel}
                placeholder={messages.contentPages.editor.relationPlaceholder}
                data={relatedOptions}
                value={values.relation || null}
                error={relationError}
                onBlur={() =>
                  setTouched((current) => ({ ...current, relation: true }))
                }
                onChange={(relation) =>
                  setValues({ ...values, relation: relation || "" })
                }
                classNames={{
                  input: classes.selectInput,
                  label: classes.selectLabel,
                }}
              />
            </Box>
          </Flex>
        </FormMetadataSection>
        <FormBodySection flex="1 1 0" mih={0} style={{ overflowY: "auto" }}>
          <BlocksList pageTitle={values.title} pageRelation={values.relation}>
            <Group justify="flex-end">
              <Button
                variant="outline"
                color="brand"
                size="sm"
                type="submit"
                loading={isSaving}
              >
                {messages.common.save}
              </Button>
            </Group>
          </BlocksList>
        </FormBodySection>
      </Stack>
    </form>
  );
}
