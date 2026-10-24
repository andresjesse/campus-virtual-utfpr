import { useCallback, useEffect, useState } from "react";

import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { flattenBlocksMetadata } from "@/helpers/virtual-map-page-helper.ts";
import type { ContentPageRecord } from "@/types/content-page.ts";
import type {
  VirtualMapEntityPage,
  VirtualMapEntityPageStatus,
  VirtualMapPageBlocksResult,
} from "@/types/virtual-map-entity-page.ts";

export function useVirtualMapPageBlocks(page: ContentPageRecord | null): VirtualMapEntityPage {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<VirtualMapPageBlocksResult | null>(null);

  const pageId = page?.id ?? null;
  const key = `${pageId}:${attempt}`;

  useEffect(() => {
    if (!pageId) return;

    let cancelled = false;

    getAllContentBlocksMetadata(pageId, false).then(
      (grouped) => {
        if (!cancelled) setResult({ key, blocks: flattenBlocksMetadata(grouped), error: null });
      },
      (error) => {
        if (!cancelled) setResult({ key, blocks: [], error: getRequestErrorMessage(error) });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [pageId, key]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const loaded = page && result?.key === key ? result : null;
  const status: VirtualMapEntityPageStatus =
    !page ? "none" : !loaded ? "loading" : loaded.error ? "error" : "ready";

  return {
    status,
    page,
    blocks: loaded?.blocks ?? [],
    error: loaded?.error ?? null,
    retry,
  };
}
