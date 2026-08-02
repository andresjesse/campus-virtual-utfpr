import { Badge, Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import ContentPageForm from "@/components/content-page-form/ContentPageForm.tsx";
import ElementPalette from "@/components/element-palette/ElementPalette.tsx";
import FeedbackState from "@/components/feedback-state";
import { useContentPageAutosave } from "@/hooks/use-content-page-autosave";
import {
  getContentPageEditorData,
  listRelatedOptions,
} from "@/services/content-page-service.ts";
import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page";

import classes from "./content-page-editor.module.css";
import {getContentPageErrorMessage} from "@/helpers/content-pages-service-helper.ts";

const AUTOSAVE_ERROR_NOTIFICATION_ID = "content-page-autosave-error";

export default function ContentPageEditorPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [relatedOptions, setRelatedOptions] = useState<RelatedOption[]>([]);
  const [initialValues, setInitialValues] = useState<ContentPageFormValues>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleCreated = useCallback(
    (createdPageId: string) => {
      navigate(`/admin/pages/${createdPageId}`, { replace: true });
    },
    [navigate],
  );

  const handleAutosaveError = useCallback((message: string) => {
    const notification = {
      id: AUTOSAVE_ERROR_NOTIFICATION_ID,
      autoClose: 8000,
      color: "red",
      title: "Não foi possível salvar",
      message,
    };

    notifications.show(notification);
    notifications.update(notification);
  }, []);

  const { queueSave, status } = useContentPageAutosave({
    onCreated: handleCreated,
    onError: handleAutosaveError,
    pageId,
  });

  const loadEditor = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [options, page] = await Promise.all([
        listRelatedOptions(),
        pageId ? getContentPageEditorData(pageId) : Promise.resolve(null),
      ]);

      setRelatedOptions(options);
      setInitialValues(
        page
          ? { relation: page.relation, title: page.page.title }
          : { relation: "", title: "" },
      );
    } catch (requestError) {
      setError(getContentPageErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  return (
    <main className={classes.page}>
      <section className={classes.workspace}>
        <Group className={classes.backRow} justify="space-between">
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<CaretDoubleLeftIcon aria-hidden size={17} />}
            onClick={() => navigate("/admin/pages")}
          >
            Voltar
          </Button>
          <Badge
            size="xs"
            color={status === "error" ? "red" : status === "saved" ? "green" : "gray"}
            variant="light"
            className={classes.saveStatus}
            aria-live="polite"
          >
            {status === "saving"
              ? "Salvando..."
              : status === "error"
                ? "Erro ao salvar"
                : "Salvo"}
          </Badge>
        </Group>

        <section className={classes.canvas} aria-label="Conteúdo da página">
          {isLoading && <FeedbackState loading title="Carregando página" />}
          {!isLoading && error && (
            <FeedbackState
              title="Não foi possível carregar a página"
              description={error}
              actionLabel="Tentar novamente"
              onAction={() => void loadEditor()}
            />
          )}
          {!isLoading && !error && initialValues && (
            <ContentPageForm
              key={`${initialValues.title}:${initialValues.relation}`}
              initialValues={initialValues}
              relatedOptions={relatedOptions}
              onChange={queueSave}
            />
          )}
        </section>
      </section>

      <ElementPalette />
    </main>
  );
}
