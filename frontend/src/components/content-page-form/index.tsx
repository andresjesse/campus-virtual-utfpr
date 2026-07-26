import { Select, TextInput } from "@mantine/core";
import { useState } from "react";

import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page";

import classes from "./content-page-form.module.css";

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
    <div className={classes.form}>
      <div className={classes.metadata}>
        <TextInput
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
          classNames={{ label: classes.titleLabel, input: classes.titleInput }}
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
      </div>
    </div>
  );
}
