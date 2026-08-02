import { useCallback, useEffect, useRef, useState } from "react";

import {
  createContentPage,
  updateContentPage,
} from "@/services/content-page-service.ts";
import type { ContentPageFormValues } from "@/types/content-page";
import {getContentPageErrorMessage} from "@/helpers/content-pages-service-helper.ts";

export type AutosaveStatus = "error" | "saved" | "saving";

type UseContentPageAutosaveOptions = {
  onCreated: (pageId: string) => void;
  onError: (message: string) => void;
  pageId?: string;
};

const AUTOSAVE_DELAY = 1200;

export function useContentPageAutosave({
  onCreated,
  onError,
  pageId,
}: UseContentPageAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>("saved");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revisionRef = useRef(0);
  const createdPageIdRef = useRef(pageId);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    createdPageIdRef.current = pageId;
  }, [pageId]);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const queueSave = useCallback(
    (values: ContentPageFormValues) => {
      const isValid = Boolean(values.title.trim() && values.relation);

      if (!isValid) {
        return;
      }

      revisionRef.current += 1;
      const revision = revisionRef.current;
      setStatus("saving");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        saveQueueRef.current = saveQueueRef.current
          .catch(() => undefined)
          .then(async () => {
            try {
              const normalizedValues = {
                ...values,
                title: values.title.trim(),
              };
              const currentPageId = createdPageIdRef.current;
              const savedPage = currentPageId
                ? await updateContentPage(currentPageId, normalizedValues)
                : await createContentPage(normalizedValues);

              if (!currentPageId) {
                createdPageIdRef.current = savedPage.id;
                onCreated(savedPage.id);
              }

              if (revision === revisionRef.current) {
                setStatus("saved");
              }
            } catch (error) {
              setStatus("error");
              onError(getContentPageErrorMessage(error));
            }
          });
      }, AUTOSAVE_DELAY);
    },
    [onCreated, onError],
  );

  return { queueSave, status };
}
