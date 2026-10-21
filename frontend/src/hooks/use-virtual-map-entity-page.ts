import { useCallback, useEffect, useState } from "react";

import { PAGE_BLOCK_COLLECTIONS } from "@/constants/content-constants.ts";
import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { getContentPageByEntity } from "@/services/content-page-service.ts";
import type {
  ContentPageBlockMetadata,
  ContentPageRecord,
} from "@/types/content-page.ts";
import type { VirtualMapEntityPageStatus } from "@/types/virtual-map-entity-page.ts";
import type { VirtualMapSelectedEntity } from "@/types/virtual-map-events.ts";

type EntityPageResult = {
  key: string;
  status: Exclude<VirtualMapEntityPageStatus, "loading">;
  page: ContentPageRecord | null;
  blocks: ContentPageBlockMetadata[];
  error: string | null;
};

export function useVirtualMapEntityPage(selected: VirtualMapSelectedEntity | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<EntityPageResult | null>(null);

  const entityId = selected?.id ?? null;
  const key = `${entityId}:${attempt}`;

  useEffect(() => {
    if (!entityId) return;

    let cancelled = false;

    async function load(id: string) {
      try {
        const page = await getContentPageByEntity(id);
        if (!page) {
          if (!cancelled) setResult({ key, status: "none", page: null, blocks: [], error: null });
          return;
        }

        const grouped = await getAllContentBlocksMetadata(page.id, false);
        const blocks = PAGE_BLOCK_COLLECTIONS.flatMap((collection) => grouped[collection] ?? []);
        if (!cancelled) setResult({ key, status: "ready", page, blocks, error: null });
      } catch (error) {
        if (!cancelled) {
          setResult({
            key,
            status: "error",
            page: null,
            blocks: [],
            error: getRequestErrorMessage(error),
          });
        }
      }
    }

    void load(entityId);

    return () => {
      cancelled = true;
    };
  }, [entityId, key]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  if (!entityId) {
    return { status: "none" as VirtualMapEntityPageStatus, page: null, blocks: [], error: null, retry };
  }

  if (!result || result.key !== key) {
    return { status: "loading" as VirtualMapEntityPageStatus, page: null, blocks: [], error: null, retry };
  }

  return { ...result, retry };
}
