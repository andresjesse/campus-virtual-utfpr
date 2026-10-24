import { useCallback, useEffect, useState } from "react";

import { buildMenuTree } from "@/helpers/menu-item-service-helper.ts";
import { getRequestErrorMessage } from "@/helpers/request-error-helper.ts";
import { listMenuItems } from "@/services/menu-item-service.ts";
import type { VirtualMapMenuResult } from "@/types/virtual-map-menu.ts";
import type { VirtualMapStatus } from "@/types/virtual-map-status.ts";

export function useVirtualMapMenu() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<VirtualMapMenuResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    listMenuItems().then(
      (items) => {
        if (!cancelled) {
          setResult({ attempt, categories: buildMenuTree(items), error: null });
        }
      },
      (error) => {
        if (!cancelled) {
          setResult({ attempt, categories: [], error: getRequestErrorMessage(error) });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const status: VirtualMapStatus =
    !result || result.attempt !== attempt ? "loading" : result.error ? "error" : "ready";

  return {
    status,
    categories: result?.categories ?? [],
    error: result?.error ?? null,
    retry,
  };
}
