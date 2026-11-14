import { useCallback, useState } from "react";

import {
  VIRTUAL_MAP_TOUR_STEP_TARGETS,
  VIRTUAL_MAP_TOUR_STEPS,
} from "@/constants/virtual-map-tour-constants.ts";
import { hasCompletedTour, markTourCompleted } from "@/helpers/virtual-map-tour-helper.ts";

export function useVirtualMapTour(enabled: boolean) {
  const [isPending, setIsPending] = useState(() => !hasCompletedTour());
  const [stepIndex, setStepIndex] = useState(0);

  const total = VIRTUAL_MAP_TOUR_STEPS.length;
  const step = VIRTUAL_MAP_TOUR_STEPS[stepIndex];
  const isLast = stepIndex === total - 1;

  const close = useCallback(() => {
    markTourCompleted();
    setIsPending(false);
  }, []);

  const next = useCallback(() => {
    if (isLast) {
      close();
      return;
    }
    setStepIndex((current) => current + 1);
  }, [isLast, close]);

  const back = useCallback(() => {
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  return {
    isOpen: enabled && isPending,
    step,
    stepIndex,
    total,
    isFirst: stepIndex === 0,
    isLast,
    target: VIRTUAL_MAP_TOUR_STEP_TARGETS[step],
    next,
    back,
    close,
  };
}
