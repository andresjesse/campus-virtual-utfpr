import { useCallback, useEffect, useState } from "react";

import { VIRTUAL_MAP_EVENTS } from "@/constants/virtual-map-constants.ts";
import { virtualMapEventBus } from "@/helpers/virtual-map-event-bus.ts";
import type { VirtualMapSelectedEntity } from "@/types/virtual-map-events.ts";

export function useVirtualMapSelection() {
  const [selected, setSelected] = useState<VirtualMapSelectedEntity | null>(null);

  useEffect(() => {
    const unregisterSelected = virtualMapEventBus.register(
      VIRTUAL_MAP_EVENTS.ENTITY_SELECTED,
      setSelected,
    );
    const unregisterCleared = virtualMapEventBus.register(
      VIRTUAL_MAP_EVENTS.SELECTION_CLEARED,
      () => setSelected(null),
    );

    return () => {
      unregisterSelected();
      unregisterCleared();
    };
  }, []);

  const clearSelection = useCallback(() => {
    virtualMapEventBus.dispatch(VIRTUAL_MAP_EVENTS.SELECTION_CLEARED);
  }, []);

  return { selected, clearSelection };
}
