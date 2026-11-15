import { useCallback, useMemo, useState } from "react";

import {
  applyGraphicsSettings,
  areGraphicsSettingsEqual,
  loadGraphicsSettings,
  readDeviceInfo,
  resolvePixelRatio,
} from "@/helpers/virtual-map-graphics-helper.ts";
import type { VirtualMapGraphicsSettings } from "@/types/virtual-map-graphics.ts";

export function useVirtualMapGraphicsSettings() {
  const [settings] = useState(loadGraphicsSettings);
  const [draft, setDraft] = useState(settings);

  const currentPixelRatio = useMemo(
    () => resolvePixelRatio(settings.pixelDensity, readDeviceInfo()),
    [settings],
  );

  const updateDraft = useCallback(
    <Key extends keyof VirtualMapGraphicsSettings>(
      key: Key,
      value: VirtualMapGraphicsSettings[Key],
    ) => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setDraft(settings), [settings]);

  const save = useCallback(() => applyGraphicsSettings(draft), [draft]);

  return {
    settings,
    draft,
    isDirty: !areGraphicsSettingsEqual(settings, draft),
    currentPixelRatio,
    updateDraft,
    reset,
    save,
  };
}
