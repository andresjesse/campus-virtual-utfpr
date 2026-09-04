import {Box, Select, Stack} from "@mantine/core";
import { useState } from "react";

import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page";

import classes from "./content-page-form.module.css";
import BlocksList from "@/components/content-page-form/BlocksList.tsx";
import TitleInput from "@/components/text-input/TitleInput.tsx";

type ContentPageFormProps = {
  initialValues?: ContentPageFormValues;
  onChange: (values: ContentPageFormValues) => void;
  relatedOptions: RelatedOption[];
};

const EMPTY_VALUES: ContentPageFormValues = { relation: "", title: "" };

export default function ContentPageForm({
  initialValues = EMPTY_VALUES,
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
      <Box className={classes.metadata} flex="0 0 auto">
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
      </Box >
      <Box
        flex="1 1 0"
        mih={0}
        style={{ overflowY: "auto" }}
      >
        <BlocksList />
      </Box>
    </Stack>
  );
}
