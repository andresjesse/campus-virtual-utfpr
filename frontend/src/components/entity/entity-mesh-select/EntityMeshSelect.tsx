import { Select } from "@mantine/core";

import messages from "@/constants/messages.json";
import type { EntityMeshOption } from "@/types/entity.ts";

type EntityMeshSelectProps = {
  error?: string;
  options: EntityMeshOption[];
  value: string;
  onBlur: () => void;
  onChange: (meshId: string) => void;
};

export default function EntityMeshSelect({
  error,
  options,
  value,
  onBlur,
  onChange,
}: EntityMeshSelectProps) {
  return (
    <Select
      searchable
      withAsterisk
      label={messages.entities.editor.meshLabel}
      placeholder={messages.entities.editor.meshPlaceholder}
      nothingFoundMessage={messages.entities.editor.meshNothingFound}
      data={options}
      // An empty string counts as a selected value for Mantine and hides the placeholder.
      value={value || null}
      error={error}
      onBlur={onBlur}
      onChange={(meshId) => onChange(meshId ?? "")}
    />
  );
}
