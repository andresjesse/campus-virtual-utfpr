import {Box, Flex, Select, Stack} from "@mantine/core";
import { useState } from "react";

import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page.ts";

import classes from "./content-page-form.module.css";
import BlocksList from "@/components/content-page/content-page-form/BlocksList.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";
import FormBodySection from "@/containers/FormBodySection.tsx";
import FormMetadataSection from "@/containers/FormMetadataSection.tsx";

type ContentPageFormProps = {
  initialValues: ContentPageFormValues;
  onChange: (values: ContentPageFormValues) => void;
  relatedOptions: RelatedOption[];
};

export default function ContentPageForm({
  initialValues,
  onChange,
  relatedOptions,
}: ContentPageFormProps) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({ relation: false, title: false });

  function updateValues(nextValues: ContentPageFormValues) {
    setValues(nextValues);
    onChange(nextValues);
  }

  const titleError =
    touched.title && !values.title.trim() ? "Informe o título" : undefined;
  const relationError =
    touched.relation && !values.relation
      ? "Selecione um elemento"
      : undefined;

  return (
    <Stack h="100%" gap={0}>
      <FormMetadataSection>
        <Flex direction={{ base: "column", md: "row" }} gap={{ base: "1rem", md: "1.4rem" }}>
          <Box style={{ flex: "1.3 1 0" }}>
            <TitleInput
              label="Título da Página"
              placeholder="Título da página"
              value={values.title}
              error={Boolean(titleError)}
              onBlur={() =>
                setTouched((current) => ({ ...current, title: true }))
              }
              onChange={(event) =>
                updateValues({
                  ...values,
                  title: event.currentTarget.value,
                })
              }
            />
          </Box>
          <Box miw={{ md: "11rem" }} style={{ flex: "0.8 1 0" }}>
            <Select
              searchable
              label="Elemento Relacionado"
              placeholder="Selecione"
              data={relatedOptions}
              value={values.relation || null}
              error={Boolean(relationError)}
              onBlur={() =>
                setTouched((current) => ({ ...current, relation: true }))
              }
              onChange={(relation) =>
                updateValues({ ...values, relation: relation || "" })
              }
              classNames={{
                input: classes.selectInput,
                label: classes.selectLabel,
              }}
            />
          </Box>
        </Flex>
      </FormMetadataSection>
      <FormBodySection
        flex="1 1 0"
        mih={0}
        style={{ overflowY: "auto" }}
      >
        <BlocksList
          pageTitle={values.title}
          pageRelation={values.relation}
        />
      </FormBodySection>
    </Stack>
  );
}
