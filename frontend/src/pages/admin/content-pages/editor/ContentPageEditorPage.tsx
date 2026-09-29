import { Badge, Box, Flex, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import ContentPageForm from "@/components/content-page/content-page-form/ContentPageForm.tsx";
import ElementPalette from "@/components/element-palette/ElementPalette.tsx";
import FeedbackState from "@/components/feedback-state";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";
import { useContentPageAutosave } from "@/hooks/use-content-page-autosave";
import {
  getContentPageEditorData,
  listRelatedOptions,
} from "@/services/content-page-service.ts";
import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page";

import {getRequestErrorMessage} from "@/helpers/request-error-helper.ts";

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
    // TODO: Move this to a helper.
    const notification = {
      id: AUTOSAVE_ERROR_NOTIFICATION_ID,
      autoClose: 8000,
      color: "red",
      title: messages.common.saveError,
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
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  return (
    <Flex
      component="main"
      direction={{ base: "column", md: "row" }}
      mih="calc(100dvh - 60px)"
    >
      <EditorPageContainer
        navRoute="/admin/pages"
        ariaLabel={messages.contentPages.editor.canvasLabel}
      >
        <Group justify="flex-end" px="xl" pt="sm">
          <Badge
            size="xs"
            color={status === "error" ? "red" : status === "saved" ? "green" : "gray"}
            variant="light"
            lts="0.02em"
            opacity={0.75}
            aria-live="polite"
          >
            {status === "saving"
              ? messages.common.saving
              : status === "error"
                ? messages.common.saveError
                : messages.common.saved}
          </Badge>
        </Group>
        {isLoading && (
          <FeedbackState loading title={messages.contentPages.editor.loading} />
        )}
        {!isLoading && error && (
          <FeedbackState
            title={messages.contentPages.editor.loadErrorTitle}
            description={error}
            actionLabel={messages.common.retry}
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
      </EditorPageContainer>

      <Box
        flex="0 0 auto"
        w={{ base: "100%", md: "16rem", lg: "19rem" }}
        bg={branding.colors.surface.sidebar}
      >
        <ElementPalette />
      </Box>
    </Flex>
  );
}
