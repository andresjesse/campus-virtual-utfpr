import { useCallback, useEffect, useState } from "react";

import { getAllContentBlocksMetadata } from "@/helpers/content-pages-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { flattenBlocksMetadata } from "@/helpers/virtual-map-page-helper.ts";
import { getContentPageByEntity } from "@/services/content-page-service.ts";
import type {
  ContentPageBlockMetadata,
  ContentPageRecord,
} from "@/types/content-page.ts";
import type { VirtualMapEntityPage, VirtualMapEntityPageStatus } from "@/types/virtual-map-entity-page.ts";
import type { VirtualMapSelectedEntity } from "@/types/virtual-map-events.ts";

type EntityPageResult = {
  key: string;
  status: Exclude<VirtualMapEntityPageStatus, "loading">;
  page: ContentPageRecord | null;
  blocks: ContentPageBlockMetadata[];
  error: string | null;
};

const NO_BLOCKS: ContentPageBlockMetadata[] = [];

export function useVirtualMapEntityPage(
  selected: VirtualMapSelectedEntity | null,
): VirtualMapEntityPage {
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
        const blocks = flattenBlocksMetadata(grouped);
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
    return { status: "none", page: null, blocks: NO_BLOCKS, error: null, retry };
  }

  if (!result || result.key !== key) {
    return { status: "loading", page: null, blocks: NO_BLOCKS, error: null, retry };
  }

  return { status: result.status, page: result.page, blocks: result.blocks, error: result.error, retry };
}
