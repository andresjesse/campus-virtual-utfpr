import { Box, Flex } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import ContentPageForm from "@/components/content-page/content-page-form/ContentPageForm.tsx";
import ElementPalette from "@/components/element-palette/ElementPalette.tsx";
import FeedbackState from "@/components/feedback-state";
import { branding } from "@/config/branding.ts";
import messages from "@/constants/messages.json";
import EditorPageContainer from "@/containers/EditorPageContainer.tsx";
import {
  createContentPage,
  getContentPageEditorData,
  listRelatedOptions,
  updateContentPage,
} from "@/services/content-page-service.ts";
import type {
  ContentPageFormValues,
  RelatedOption,
} from "@/types/content-page";

import {getRequestErrorMessage} from "@/helpers/request-error-helper.ts";

export default function ContentPageEditorPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [relatedOptions, setRelatedOptions] = useState<RelatedOption[]>([]);
  const [initialValues, setInitialValues] = useState<ContentPageFormValues>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const handleSubmit = useCallback(
    async (values: ContentPageFormValues) => {
      if (pageId) {
        await updateContentPage(pageId, values);
      } else {
        const createdPage = await createContentPage(values);

        navigate(`/admin/pages/${createdPage.id}`, { replace: true });
      }

      notifications.show({
        color: "green",
        title: messages.contentPages.editor.saveSuccessTitle,
        message: messages.contentPages.editor.saveSuccessMessage,
      });
    },
    [navigate, pageId],
  );

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
            key={pageId ?? "new"}
            initialValues={initialValues}
            relatedOptions={relatedOptions}
            onSubmit={handleSubmit}
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
